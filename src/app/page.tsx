'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Artist = {
  id: string
  name: string
  bio: string
  image_url: string
  spotify_url: string
  soundcloud_url: string
  website_url: string
}

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtists = async () => {
      const { data, error } = await supabase.from('artists').select('*')
      if (error) {
        console.error('Error fetching artists:', error.message)
        setError(error.message)
      } else {
        setArtists(data)
      }
    }

    fetchArtists()
  }, [])

  return (
    <main className="p-8 sm:p-16 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Featured Artists</h1>

      {error && (
        <p className="text-red-600 text-center mb-6">
          Error: {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {artists.map((artist) => {
          console.log('Rendering artist:', artist.name, artist.image_url)

          return (
            <div key={artist.id} className="border rounded-lg p-6 shadow-md hover:shadow-xl transition-all">
              {artist.image_url ? (
                <Image
                  src={artist.image_url}
                  alt={artist.name}
                  width={300}
                  height={200}
                  className="object-cover w-full h-48 rounded-md mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              <h2 className="text-2xl font-semibold">{artist.name}</h2>
              <p className="text-gray-700 text-sm my-2">{artist.bio}</p>
              <div className="flex gap-3 mt-2">
                {artist.spotify_url && (
                  <a href={artist.spotify_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Spotify
                  </a>
                )}
                {artist.soundcloud_url && (
                  <a href={artist.soundcloud_url} target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">
                    SoundCloud
                  </a>
                )}
                {artist.website_url && (
                  <a href={artist.website_url} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">
                    Website
                  </a>
                )}
              </div>
              <Link href={`/artist/${artist.id}`}>
                <div className="mt-4 inline-block bg-black text-white py-2 px-4 rounded hover:bg-gray-800 cursor-pointer">
                  Vote on Songs →
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </main>
  )
}