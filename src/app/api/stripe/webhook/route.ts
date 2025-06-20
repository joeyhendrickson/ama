'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/lib/supabaseClient'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Song {
  id: string
  title: string
  vote_price: number
}

export default function CartPage() {
  const [cart, setCart] = useState<{ [songId: string]: number }>({})
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      setCart(parsedCart)
      const songIds = Object.keys(parsedCart)

      if (songIds.length > 0) {
        supabase
          .from('songs')
          .select('id, title, vote_price')
          .in('id', songIds)
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching songs:', error.message)
            } else {
              setSongs(data || [])
            }
          })
      }
    }
  }, [])

  const handleCheckout = async () => {
    setLoading(true)
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart })
    })

    if (!response.ok) {
      console.error('Failed to create checkout session')
      setLoading(false)
      return
    }

    const { sessionId } = await response.json()
    const stripe = await stripePromise
    await stripe?.redirectToCheckout({ sessionId })
  }

  const total = songs.reduce((acc, song) => {
    const quantity = cart[song.id] || 0
    return acc + song.vote_price * quantity
  }, 0)

  return (
    <main className="p-8 sm:p-16 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Voting Cart</h1>

      {Object.keys(cart).length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-6">
            {songs.map((song) => (
              <li key={song.id} className="mb-2 text-gray-800">
                {song.title} × {cart[song.id]} votes @ ${song.vote_price} = ${cart[song.id] * song.vote_price}
              </li>
            ))}
          </ul>

          <p className="text-lg font-semibold mb-6">Total: ${total}</p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
          >
            {loading ? 'Redirecting...' : 'Proceed to Stripe Checkout'}
          </button>
        </>
      )}
    </main>
  )
}
