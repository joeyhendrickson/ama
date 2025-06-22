// src/app/api/stripe/webhook/route.ts

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabaseClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(req: Request) {
  const rawBody = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('❌ Stripe webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const votes = JSON.parse(session.metadata?.votes || '{}')
      const voiceCommentIds = JSON.parse(session.metadata?.voiceCommentIds || '[]')

      // Update vote counts for songs
      for (const [songId, voteCount] of Object.entries(votes)) {
        await supabase.rpc('increment_votes', {
          song_id: songId,
          increment_by: Number(voteCount),
        })
      }

      // Update voice comments status if any were included in the purchase
      if (voiceCommentIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('voice_comments')
            .update({
              status: 'purchased',
              purchase_session_id: session.id
            })
            .in('id', voiceCommentIds)
            .select()

          if (error) {
            console.error('Error updating voice comments:', error)
          } else {
            console.log(`Updated ${data?.length || 0} voice comments to purchased status`)
            
            // Send email notifications to artists
            if (data && data.length > 0) {
              // Group comments by artist
              const commentsByArtist = data.reduce((acc, comment) => {
                if (!acc[comment.artist_id]) {
                  acc[comment.artist_id] = []
                }
                acc[comment.artist_id].push(comment)
                return acc
              }, {} as { [artistId: string]: any[] })

              // Send notification to each artist
              for (const [artistId, comments] of Object.entries(commentsByArtist)) {
                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notify-artist`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      artistId,
                      purchaseSessionId: session.id
                    }),
                  })

                  if (response.ok) {
                    console.log(`Email notification sent to artist ${artistId}`)
                  } else {
                    console.error(`Failed to send email notification to artist ${artistId}`)
                  }
                } catch (emailError) {
                  console.error(`Error sending email notification to artist ${artistId}:`, emailError)
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in voice comment update:', error)
        }
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}