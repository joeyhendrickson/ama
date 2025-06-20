// src/app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') as string
  const body = await req.text()

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed.', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      console.log('✅ Stripe Checkout completed:', session.id)
      break
    }
    default:
      console.log(`🔔 Unhandled event type: ${event.type}`)
  }

  return new NextResponse('Webhook received', { status: 200 })
}