// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabaseClient'

// Create Stripe client only if we have the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'placeholder_key'
const stripe = stripeSecretKey !== 'placeholder_key' 
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' })
  : null

export async function POST(req: Request) {
  try {
    // If we don't have a valid Stripe client, return an error
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment service not available' },
        { status: 503 }
      )
    }

    const { items, voiceCommentIds } = await req.json() // items: [{ songId, title, vote_price, quantity }]

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Get song information for metadata
    const songIds = items.map((item: any) => item.songId)
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('id, artist_name, title')
      .in('id', songIds)

    if (songsError) {
      console.error('Error fetching songs:', songsError)
      return NextResponse.json(
        { error: 'Error fetching song information' },
        { status: 500 }
      )
    }

    // Create a map of songId to artistName
    const songToArtistMap: { [key: string]: string } = {}
    songs?.forEach((song: any) => {
      songToArtistMap[song.id] = song.artist_name || 'Joey Hendrickson'
    })

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.vote_price * 100), // in cents
      },
      quantity: item.quantity,
    }))

    // Prepare metadata for purchases and voice comments
    const purchases: { [key: string]: number } = {}
    
    items.forEach((item: any) => {
      purchases[item.songId] = item.quantity
    })

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.vote_price * item.quantity), 0)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        purchases: JSON.stringify(purchases),
        voiceCommentIds: JSON.stringify(voiceCommentIds || []),
        totalAmount: totalAmount.toString()
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err.message)
    return NextResponse.json(
      { error: 'Unable to create checkout session' },
      { status: 500 }
    )
  }
}
