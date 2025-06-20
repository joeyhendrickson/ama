// src/app/artist/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface Artist {
  id: string
  name: string
  bio: string
  image_url: string
}

interface Song {
  id: string
  artist_id: string
  title: string
  audio_url: string
  vote_count: number
  vote_goal: number
}

export default function ArtistPage() {
  const { id } = useParams()
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<{ [songId: string]: number }>({})

  useEffect(() => {
    const fetchArtist = async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, bio, image_url')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching artist:', error.message)
        setError(error.message)
      } else {
        setArtist(data)
      }
    }

    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', id)

      if (error) {
        console.error('Error fetching songs:', error.message)
        setError(error.message)
      } else {
        setSongs(data)
      }
    }

    const loadCart = () => {
      const stored = localStorage.getItem('cart')
      if (stored) {
        setCart(JSON.parse(stored))
      }
    }

    if (id) {
      fetchArtist()
      fetchSongs()
      loadCart()
    }
  }, [id])

  const addVote = (songId: string) => {
    setCart((prev) => {
      const updated = { ...prev, [songId]: (prev[songId] || 0) + 1 }
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  const removeVote = (songId: string) => {
    setCart((prev) => {
      const count = (prev[songId] || 1) - 1
      const updated = { ...prev, [songId]: Math.max(0, count) }
      if (updated[songId] === 0) delete updated[songId]
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  if (error) {
    return <p className="text-red-600 p-4">Error: {error}</p>
  }

  if (!artist) {
    return <p className="p-4">Loading artist...</p>
  }

  return (
    <main className="p-8 sm:p-16 bg-white min-h-screen">
      <Link href="/" className="text-blue-600 underline mb-6 inline-block">
        ← Back to Home
      </Link>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
        {artist.image_url ? (
          <Image
            src={artist.image_url}
            alt={artist.name}
            width={200}
            height={200}
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="w-[200px] h-[200px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        <div>
          <h1 className="text-4xl font-bold text-gray-900">{artist.name}</h1>
          <p className="text-gray-700 mt-2">{artist.bio}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Vote for Songs</h2>

      <div className="grid grid-cols-1 gap-8">
        {songs.map((song) => (
          <div key={song.id} className="border p-6 rounded shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{song.title}</h3>

            {song.audio_url ? (
              <audio controls className="mb-3 w-full">
                <source src={song.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No audio uploaded</p>
            )}

            <p className="text-sm text-gray-600 mb-2">
              Votes: {(song.vote_count || 0) + (cart[song.id] || 0)} / {song.vote_goal || 'Goal not set'}
            </p>

            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => removeVote(song.id)}
                disabled={!cart[song.id]}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                −
              </button>
              <span>{cart[song.id] || 0}</span>
              <button
                onClick={() => addVote(song.id)}
                className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              >
                ＋
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 border rounded bg-gray-50">
        <h3 className="text-xl font-semibold mb-3">Cart Summary</h3>
        <ul className="mb-4">
          {Object.entries(cart).map(([songId, count]) => {
            const song = songs.find((s) => s.id === songId)
            return song ? (
              <li key={songId} className="text-gray-700">
                {song.title} × {count}
              </li>
            ) : null
          })}
        </ul>

        <button
          onClick={() => router.push('/cart')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </main>
  )
}