// src/app/api/stripe/webhook/route.ts
// Simplified webhook for personal site - all payments go to Joey's Stripe account

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabaseClient'

// Create Stripe client only if we have the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'placeholder_key'
const stripe = stripeSecretKey !== 'placeholder_key' 
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' })
  : null

export async function POST(req: Request) {
  // If we don't have a valid Stripe client, return an error
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment service not available' },
      { status: 503 }
    )
  }

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
      const purchases = JSON.parse(session.metadata?.purchases || '{}')
      const voiceCommentIds = JSON.parse(session.metadata?.voiceCommentIds || '[]')
      const totalAmount = parseFloat(session.metadata?.totalAmount || '0')

      console.log('Processing checkout session:', session.id)
      console.log('Purchases:', purchases)
      console.log('Total amount:', totalAmount)

      // Update vote counts for songs (if applicable)
      for (const [songId, quantity] of Object.entries(purchases)) {
        try {
          // Try to increment votes if the function exists
          const { error: voteError } = await supabase.rpc('increment_votes', {
            song_id: songId,
            increment_by: Number(quantity),
          })

          if (voteError) {
            // If RPC doesn't exist, just log it (votes might not be used)
            console.log(`Note: Could not increment votes for song ${songId}:`, voteError.message)
          }
        } catch (error) {
          console.error(`Error updating votes for song ${songId}:`, error)
        }
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
          }
        } catch (error) {
          console.error('Error in voice comment update:', error)
        }
      }

      // Record the purchase transaction (for analytics/reporting)
      try {
        const { error: transactionError } = await supabase
          .from('purchase_transactions')
          .insert({
            stripe_payment_intent_id: session.id,
            amount: totalAmount,
            status: 'completed',
            customer_email: session.customer_details?.email || null,
            payout_date: new Date().toISOString()
          })
          .catch(() => {
            // Table might not exist yet, that's okay
            console.log('Note: purchase_transactions table may not exist')
          })

        if (transactionError && transactionError.code !== '42P01') {
          console.error('Error recording transaction:', transactionError)
        }
      } catch (error) {
        // Table might not exist, that's fine
        console.log('Note: Could not record transaction (table may not exist)')
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
