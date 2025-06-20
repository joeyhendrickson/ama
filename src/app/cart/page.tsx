// src/app/cart/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Song {
  id: string
  title: string
  vote_price: number
  current_votes: number
  vote_goal: number
}

export default function CartPage() {
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [cart, setCart] = useState<{ [songId: string]: number }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    const parsedCart = savedCart ? JSON.parse(savedCart) : {}
    setCart(parsedCart)

    const fetchSongs = async () => {
      const songIds = Object.keys(parsedCart)
      if (songIds.length === 0) {
        setSongs([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('songs')
        .select('id, title, vote_price, current_votes, vote_goal')
        .in('id', songIds)

      if (error) {
        console.error('Error fetching songs:', error.message)
      } else {
        setSongs(data || [])
      }
      setLoading(false)
    }

    fetchSongs()
  }, [])

  const totalPrice = songs.reduce((total, song) => {
    const count = cart[song.id] || 0
    return total + count * (song.vote_price || 1)
  }, 0)

  const handleCheckout = () => {
    alert('Checkout not yet implemented.')
  }

  if (loading) return <p className="p-4">Loading your cart...</p>

  return (
    <main className="p-8 sm:p-16 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Your Voting Cart</h1>

      {songs.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-6 space-y-4">
            {songs.map((song) => (
              <li key={song.id} className="border p-4 rounded shadow-sm">
                <h2 className="text-xl font-semibold mb-2">{song.title}</h2>
                <p className="text-sm text-gray-700">
                  Votes: {cart[song.id]} × ${song.vote_price.toFixed(2)} = ${(
                    cart[song.id] * song.vote_price
                  ).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Current: {song.current_votes} / {song.vote_goal || 'Goal not set'}
                </p>
              </li>
            ))}
          </ul>

          <div className="text-right text-lg font-medium mb-6">
            Total: ${totalPrice.toFixed(2)}
          </div>

          <button
            onClick={handleCheckout}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
          >
            Complete Purchase
          </button>
        </>
      )}
    </main>
  )
}