// app/api/stripe/create-account/route.ts

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabaseClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    console.log('▶ Received artist name:', name)

    if (!name) {
      console.error('⛔ Missing artist name in request.')
      return NextResponse.json({ error: 'Missing artist name.' }, { status: 400 })
    }

    // Look up artist in Supabase
    const { data: artist, error } = await supabase
      .from('artists')
      .select('email')
      .eq('name', name)
      .single()

    if (error || !artist?.email) {
      console.error('⛔ Artist not found or missing email:', error)
      return NextResponse.json({ error: 'Artist not found or missing email.' }, { status: 404 })
    }

    console.log('✅ Found artist:', artist)

    // Create Stripe account
    const account = await stripe.accounts.create({
      type: 'express',
      email: artist.email,
      metadata: {
        artistName: name,
      },
    })

    console.log('✅ Created Stripe account:', account.id)

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/complete`,
      type: 'account_onboarding',
    })

    console.log('✅ Stripe onboarding URL:', accountLink.url)

    return NextResponse.json({ url: accountLink.url })
  } catch (err: any) {
    console.error('🔥 Stripe Connect error:', err.message || err)
    return NextResponse.json(
      { error: 'Unable to create Stripe Connect account.' },
      { status: 500 }
    )
  }
}