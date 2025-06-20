// src/app/api/stripe/webhook/route.ts

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = headers().get('stripe-signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('❌ Error verifying Stripe webhook signature:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata
      const votes = JSON.parse(metadata?.votes || '{}')

      for (const [songId, voteCount] of Object.entries(votes)) {
        await supabase.rpc('increment_votes', {
          song_id: songId,
          increment_by: Number(voteCount),
        })
      }

      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}