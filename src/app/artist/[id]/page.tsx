// src/app/artist/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useCart, CartItem } from '@/context/CartContext'

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
  console.log('ArtistPage component rendering')
  
  const { id } = useParams()
  const router = useRouter()
  const { cartItems, addToCart, removeFromCart } = useCart()

  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [error, setError] = useState<string | null>(null)
  const [allArtists, setAllArtists] = useState<Artist[]>([])
  const [currentArtistIndex, setCurrentArtistIndex] = useState<number>(-1)
  const [flippedCards, setFlippedCards] = useState<{ [songId: string]: boolean }>({})
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [voiceComments, setVoiceComments] = useState<{ [songId: string]: string }>({})
  const [isRecording, setIsRecording] = useState<{ [songId: string]: boolean }>({})
  const [audioBlobs, setAudioBlobs] = useState<{ [songId: string]: Blob }>({})
  const [isPlayingBack, setIsPlayingBack] = useState<{ [songId: string]: boolean }>({})
  const [showPlayback, setShowPlayback] = useState<{ [songId: string]: boolean }>({})
  const [mediaRecorder, setMediaRecorder] = useState<{ [songId: string]: MediaRecorder | null }>({})
  const [showPaymentModal, setShowPaymentModal] = useState<{ [songId: string]: boolean }>({})

  useEffect(() => {
    const fetchAllArtists = async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, bio, image_url')
        .order('name')

      if (error) {
        console.error('Error fetching all artists:', error.message)
      } else {
        setAllArtists(data || [])
      }
    }

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

    if (id) {
      fetchAllArtists()
      fetchArtist()
      fetchSongs()
    }
  }, [id])

  useEffect(() => {
    if (artist && allArtists.length > 0) {
      const index = allArtists.findIndex(a => a.id === artist.id)
      setCurrentArtistIndex(index)
    }
  }, [artist, allArtists])

  const addVote = (song: Song) => {
    addToCart({
      songId: song.id,
      songTitle: song.title,
      artistId: song.artist_id,
      voteCount: 1,
      votePrice: 1.00
    })
  }

  const removeVote = (songId: string) => {
    removeFromCart(songId)
  }

  const getVotePercentage = (voteCount: number, voteGoal: number) => {
    return Math.min(Math.round((voteCount / voteGoal) * 100), 100)
  }

  const navigateToArtist = (artistId: string) => {
    router.push(`/artist/${artistId}`)
  }

  const getPreviousArtist = () => {
    if (currentArtistIndex <= 0) return null
    return allArtists[currentArtistIndex - 1]
  }

  const getNextArtist = () => {
    if (currentArtistIndex >= allArtists.length - 1) return null
    return allArtists[currentArtistIndex + 1]
  }

  const toggleCardFlip = (songId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [songId]: !prev[songId]
    }))
  }

  const handlePlayAudio = (songId: string) => {
    // Stop any currently playing audio
    if (currentlyPlaying && currentlyPlaying !== songId) {
      const prevAudio = document.getElementById(`audio-${currentlyPlaying}`) as HTMLAudioElement
      if (prevAudio) {
        prevAudio.pause()
        prevAudio.currentTime = 0
      }
    }

    const audio = document.getElementById(`audio-${songId}`) as HTMLAudioElement
    if (audio) {
      if (audio.paused) {
        audio.play()
        setCurrentlyPlaying(songId)
      } else {
        audio.pause()
        setCurrentlyPlaying(null)
      }
    }
  }

  const handleAudioEnded = (songId: string) => {
    setCurrentlyPlaying(null)
    const progress = document.getElementById(`progress-${songId}`)
    if (progress) {
      progress.style.width = '0%'
    }
  }

  const startRecording = (songId: string) => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream)
          const chunks: Blob[] = []
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data)
            }
          }
          
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' })
            setAudioBlobs(prev => ({
              ...prev,
              [songId]: blob
            }))
            setShowPlayback(prev => ({
              ...prev,
              [songId]: true
            }))
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop())
          }
          
          recorder.start()
          setMediaRecorder(prev => ({
            ...prev,
            [songId]: recorder
          }))
          setIsRecording(prev => ({
            ...prev,
            [songId]: true
          }))
          setVoiceComments(prev => ({
            ...prev,
            [songId]: ''
          }))
        })
        .catch(err => {
          console.error('Error accessing microphone:', err)
          alert('Unable to access microphone. Please check permissions.')
        })
    }
  }

  const stopRecording = (songId: string) => {
    const recorder = mediaRecorder[songId]
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
    setIsRecording(prev => ({
      ...prev,
      [songId]: false
    }))
  }

  const playBackRecording = (songId: string) => {
    const blob = audioBlobs[songId]
    if (blob) {
      const audio = new Audio(URL.createObjectURL(blob))
      audio.onended = () => {
        setIsPlayingBack(prev => ({
          ...prev,
          [songId]: false
        }))
      }
      audio.play()
      setIsPlayingBack(prev => ({
        ...prev,
        [songId]: true
      }))
    }
  }

  const submitVoiceComment = async (songId: string) => {
    const songInCart = cartItems.find(item => item.songId === songId)
    if (!songInCart || songInCart.voteCount === 0) {
      setShowPaymentModal(prev => ({
        ...prev,
        [songId]: true
      }))
      return
    }

    const blob = audioBlobs[songId]
    if (!blob) {
      alert('No voice comment recorded.')
      return
    }

    try {
      // Convert blob to base64 for email
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Audio = reader.result as string
        
        const response = await fetch('/api/submit-voice-comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            songId,
            artistId: artist?.id,
            comment: voiceComments[songId] || 'Voice comment recorded',
            audioData: base64Audio,
            songTitle: songs.find(s => s.id === songId)?.title,
            artistName: artist?.name
          }),
        })

        if (response.ok) {
          alert('Voice comment sent to artist successfully!')
          // Clear the recording
          setAudioBlobs(prev => {
            const newBlobs = { ...prev }
            delete newBlobs[songId]
            return newBlobs
          })
          setVoiceComments(prev => ({
            ...prev,
            [songId]: ''
          }))
          setShowPlayback(prev => ({
            ...prev,
            [songId]: false
          }))
        } else {
          alert('Failed to send voice comment. Please try again.')
        }
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error submitting voice comment:', error)
      alert('Error submitting voice comment. Please try again.')
    }
  }

  const discardVoiceComment = (songId: string) => {
    setAudioBlobs(prev => {
      const newBlobs = { ...prev }
      delete newBlobs[songId]
      return newBlobs
    })
    setVoiceComments(prev => ({
      ...prev,
      [songId]: ''
    }))
    setShowPlayback(prev => ({
      ...prev,
      [songId]: false
    }))
    setIsRecording(prev => ({
      ...prev,
      [songId]: false
    }))
  }

  const handleMaybeLater = (songId: string) => {
    setShowPaymentModal(prev => ({
      ...prev,
      [songId]: false
    }))
  }

  const handleAddToRocketFuel = (songId: string) => {
    const song = songs.find(s => s.id === songId)
    if (song) {
      addVote(song)
    }
    setShowPaymentModal(prev => ({
      ...prev,
      [songId]: false
    }))
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="bg-red-900/50 backdrop-blur-md border border-red-400/30 rounded-xl p-6 text-red-200">
          Error: {error}
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="bg-blue-800/50 backdrop-blur-md border border-blue-400/30 rounded-xl p-6 text-white">
          Loading artist...
        </div>
      </div>
    )
  }

  // Add a simple test render
  console.log('About to render main component')
  
  const previousArtist = getPreviousArtist()
  const nextArtist = getNextArtist()
  const totalVotesInCart = cartItems.reduce((sum, item) => sum + item.voteCount, 0)
  const fuelPercentage = Math.min((totalVotesInCart / 50) * 100, 100) // Assuming 50 votes is a full tank

  return (
    <div className="min-h-screen bg-[#040a12]">
      {/* Left Arrow - Previous Artist or Home */}
      {previousArtist ? (
        <button 
          onClick={() => navigateToArtist(previousArtist.id)}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 inline-flex items-center justify-center w-12 h-12 bg-white backdrop-blur-md border border-white/30 rounded-full text-blue-800 hover:text-blue-900 hover:bg-gray-100 transition-all duration-300 group shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <Link 
          href="/" 
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 inline-flex items-center justify-center w-12 h-12 bg-white backdrop-blur-md border border-white/30 rounded-full text-blue-800 hover:text-blue-900 hover:bg-gray-100 transition-all duration-300 group shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      )}

      {/* Right Arrow - Next Artist */}
      {nextArtist && (
        <button 
          onClick={() => navigateToArtist(nextArtist.id)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 inline-flex items-center justify-center w-12 h-12 bg-white backdrop-blur-md border border-white/30 rounded-full text-blue-800 hover:text-blue-900 hover:bg-gray-100 transition-all duration-300 group shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6 group-hover:translate-x-1 transition-transform"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        {/* Artist Info */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-12">
          {artist.image_url ? (
            <div className="flex justify-center">
              <div className="relative w-80 h-80 overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={artist.image_url}
                  alt={artist.name}
                  fill
                  className="object-cover object-top"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          ) : (
            <div className="w-80 h-80 bg-blue-800/50 backdrop-blur-md border border-blue-400/30 rounded-2xl flex items-center justify-center text-blue-200">
              No Image
            </div>
          )}

          <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-8 rounded-2xl flex-1">
            <h1 className="text-5xl font-bold text-white mb-4">{artist.name}</h1>
            <p className="text-blue-200 text-lg leading-relaxed">{artist.bio}</p>
          </div>
        </div>

        {/* Songs Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Vote for Songs</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {songs.map((song) => {
              const cartItem = cartItems.find(item => item.songId === song.id)
              const totalVotes = (song.vote_count || 0) + (cartItem?.voteCount || 0)
              const votePercentage = getVotePercentage(totalVotes, song.vote_goal || 100)
              const isFlipped = flippedCards[song.id] || false
              const isPlaying = currentlyPlaying === song.id
              
              return (
                <div key={song.id} className="relative group perspective-1000">
                  {/* Flip Card Container */}
                  <div 
                    className={`relative w-full h-96 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => toggleCardFlip(song.id)}
                  >
                    {/* Front of Card - Audio Player */}
                    <div className="absolute inset-0 bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all backface-hidden">
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                        {song.title}
                      </h3>

                      {song.audio_url ? (
                        <div className="mb-6">
                          <div className="bg-blue-900/30 border border-blue-400/20 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <button 
                                className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePlayAudio(song.id)
                                }}
                              >
                                {isPlaying ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                  >
                                    <path d="M6 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1H6zM12 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5 ml-0.5"
                                  >
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">{song.title}</div>
                                <div className="text-blue-300 text-xs">
                                  {isPlaying ? 'Now Playing' : 'Click to play'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Custom Progress Bar */}
                            <div className="relative">
                              <div className="w-full bg-blue-800/50 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-100 ease-out"
                                  style={{ width: '0%' }}
                                  id={`progress-${song.id}`}
                                />
                              </div>
                              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     const audio = document.getElementById(`audio-${song.id}`) as HTMLAudioElement
                                     const rect = e.currentTarget.getBoundingClientRect()
                                     const clickX = e.clientX - rect.left
                                     const percentage = (clickX / rect.width) * 100
                                     if (audio) {
                                       audio.currentTime = (percentage / 100) * audio.duration
                                     }
                                   }}
                              />
                            </div>
                            
                            {/* Hidden Audio Element */}
                            <audio 
                              id={`audio-${song.id}`}
                              src={song.audio_url}
                              onTimeUpdate={(e) => {
                                const audio = e.target as HTMLAudioElement
                                const progress = document.getElementById(`progress-${song.id}`)
                                if (progress && audio.duration) {
                                  const percentage = (audio.currentTime / audio.duration) * 100
                                  progress.style.width = `${percentage}%`
                                }
                              }}
                              onEnded={() => handleAudioEnded(song.id)}
                              className="hidden"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-400/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5 text-gray-400"
                              >
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-gray-400 font-medium text-sm">No audio uploaded</div>
                              <div className="text-gray-500 text-xs">Audio file not available</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Vote Progress */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
                          <span>Votes: {totalVotes} / {song.vote_goal || 'Goal not set'}</span>
                          <span className="font-bold">{votePercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-600/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${votePercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-blue-300 mt-2">
                          <span>Price per vote: $1.00</span>
                          <span>Total: ${(cartItem?.voteCount || 0) * 1.00}</span>
                        </div>
                      </div>

                      {/* Vote Controls */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeVote(song.id)
                          }}
                          disabled={!cartItem}
                          className="w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-xl font-bold"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-white min-w-[3rem] text-center">
                          {cartItem?.voteCount || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addVote(song)
                          }}
                          className="w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-all flex items-center justify-center text-xl font-bold"
                        >
                          ＋
                        </button>
                      </div>

                      {/* Flip Hint */}
                      <div className="text-center text-blue-300 text-sm">
                        Click outside player to record voice comment
                      </div>
                    </div>

                    {/* Back of Card - Voice Comment */}
                    <div className="absolute inset-0 bg-black backdrop-blur-md border border-gray-600/30 p-6 rounded-2xl shadow-xl rotate-y-180 backface-hidden">
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-white">Voice Comment</h3>
                          {isRecording[song.id] && (
                            <div className="flex items-center gap-2 text-red-400">
                              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                              <span className="text-sm">Recording</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto mb-4">
                          {!audioBlobs[song.id] && !isRecording[song.id] ? (
                            <div className="text-gray-400 text-center py-8">
                              <div className="text-4xl mb-4">🎤</div>
                              <div className="text-lg font-semibold mb-2">Record Your Thoughts</div>
                              <div className="text-sm mb-6">
                                Share your feedback about &quot;{song.title}&quot;
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startRecording(song.id)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                              >
                                Start Comment
                              </button>
                            </div>
                          ) : isRecording[song.id] ? (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-4">🔴</div>
                              <div className="text-lg font-semibold mb-2 text-red-400">Recording...</div>
                              <div className="text-sm text-gray-400 mb-6">
                                Speak your mind about &quot;{song.title}&quot;
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  stopRecording(song.id)
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                              >
                                End Recording
                              </button>
                            </div>
                          ) : showPlayback[song.id] ? (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-4">🎵</div>
                              <div className="text-lg font-semibold mb-2 text-green-400">Recording Complete!</div>
                              <div className="text-sm text-gray-400 mb-6">
                                Listen to your comment about &quot;{song.title}&quot;
                              </div>
                              <div className="space-y-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    playBackRecording(song.id)
                                  }}
                                  disabled={isPlayingBack[song.id]}
                                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                  {isPlayingBack[song.id] ? 'Playing...' : 'Play Recording'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    submitVoiceComment(song.id)
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                  Send to Artist
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    discardVoiceComment(song.id)
                                  }}
                                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                  Discard & Record Again
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        
                        <div className="text-center text-gray-400 text-sm">
                          {isRecording[song.id] ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                              <span>Recording your comment...</span>
                            </div>
                          ) : (
                            <div>Click to flip back to player</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rocket Fuel Section */}
        {cartItems.length > 0 && (
          <div className="w-full px-4 md:px-8 lg:px-16 py-8">
            <div 
              className="relative w-full h-48 md:h-64 lg:h-80 bg-contain bg-no-repeat bg-center"
              style={{ 
                backgroundImage: "url('/rocket-background.jpg')",
                transform: 'scaleX(-1)',
              }}
            >
              <div 
                className="absolute inset-0"
                style={{ transform: 'scaleX(-1)' }}
              >
                {/* Fuel Line Container */}
                <div className="absolute" style={{ top: '42%', left: '25%', width: '45%', height: '16%' }}>
                  <div className="w-full h-full bg-black/30 rounded-full border-2 border-gray-400/50 overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full transition-all duration-1000 ease-in-out"
                      style={{ width: `${fuelPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Content Container */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-1/2 lg:w-1/3 p-4">
                  <div className="bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-2 text-center">
                      Rocket Fuel
                    </h3>
                    <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.songId} className="flex justify-between items-center text-white text-sm">
                          <span className="font-medium truncate">{item.songTitle}</span>
                          <span className="font-bold text-yellow-300 ml-2 whitespace-nowrap">× {item.voteCount} (${(item.voteCount * item.votePrice).toFixed(2)})</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => router.push('/cart')}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border-2 border-red-400/80 shadow-lg shadow-orange-500/30"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                        />
                      </svg>
                      Proceed to Blast Off
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Required Modal */}
        {songs.map((song) => 
          showPaymentModal[song.id] && (
            <div key={`payment-modal-${song.id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 rounded-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-bold text-white mb-2">Rocket Fuel Required!</h3>
                  <p className="text-blue-200 text-sm">
                    To send your voice comment about &quot;{song.title}&quot; to the artist, just add it to your rocket fuel and proceed to blast off before you LaunchThatSong.com!
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleAddToRocketFuel(song.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                      />
                    </svg>
                    Add To My Rocket Fuel
                  </button>
                  <button
                    onClick={() => handleMaybeLater(song.id)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}