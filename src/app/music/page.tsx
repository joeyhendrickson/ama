'use client'

import { useState, useEffect } from 'react'

type Song = {
  id: string
  title: string
  artist_name: string
  genre: string
  created_at: string
  audio_url?: string
  image_url?: string
}

export default function Music() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [flippedCards, setFlippedCards] = useState<{ [songId: string]: boolean }>({})
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState<{ [songId: string]: boolean }>({})
  const [audioBlobs, setAudioBlobs] = useState<{ [songId: string]: Blob }>({})
  const [isPlayingBack, setIsPlayingBack] = useState<{ [songId: string]: boolean }>({})
  const [showPlayback, setShowPlayback] = useState<{ [songId: string]: boolean }>({})
  const [mediaRecorder, setMediaRecorder] = useState<{ [songId: string]: MediaRecorder | null }>({})
  const [comments, setComments] = useState<{ [songId: string]: { audioData: string, timestamp: Date }[] }>({})
  
  // Download and album state
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/music/songs')
      const data = await response.json()
      if (data.success) {
        setSongs(data.songs)
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        if (newSet.size < 10) {
          newSet.add(songId)
        } else {
          alert('You can select up to 10 songs for a custom album')
        }
      }
      return newSet
    })
  }

  const handleDownloadSong = async (songId: string) => {
    setProcessingPayment(true)
    try {
      // Create PayPal order for single song
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'song',
          items: [songId]
        })
      })

      const data = await response.json()
      if (data.success && data.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.approvalUrl
      } else {
        alert('Failed to create payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCreateAlbum = () => {
    if (selectedSongs.size === 0) {
      alert('Please select at least one song')
      return
    }
    if (selectedSongs.size > 10) {
      alert('You can select up to 10 songs for a custom album')
      return
    }
    setShowAlbumModal(true)
  }

  const handlePurchaseAlbum = async () => {
    if (selectedSongs.size === 0) {
      alert('Please select songs for your album')
      return
    }
    
    setProcessingPayment(true)
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'album',
          items: Array.from(selectedSongs)
        })
      })

      const data = await response.json()
      if (data.success && data.approvalUrl) {
        // Store order ID in sessionStorage for after payment
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          orderId: data.orderId,
          type: 'album',
          songIds: Array.from(selectedSongs)
        }))
        // Redirect to PayPal
        window.location.href = data.approvalUrl
      } else {
        alert('Failed to create payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Check for PayPal return and process download
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const payerId = urlParams.get('PayerID')

    if (token && payerId) {
      // Capture the order
      fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: token })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.purchaseDetails) {
            // Get download links
            const songIds = data.purchaseDetails.items || []
            fetch('/api/music/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                songIds: songIds,
                orderId: data.orderId
              })
            })
              .then(res => res.json())
              .then(downloadData => {
                if (downloadData.success) {
                  // Download all files
                  downloadData.downloads.forEach((item: any) => {
                    const link = document.createElement('a')
                    link.href = item.downloadUrl
                    link.download = `${item.title} - ${item.artist_name}.mp3`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  })
                  alert('Download complete!')
                  // Clear selection
                  setSelectedSongs(new Set())
                  // Clean up URL
                  window.history.replaceState({}, document.title, '/music')
                } else {
                  alert('Error getting download links. Please contact support.')
                }
              })
              .catch(error => {
                console.error('Download error:', error)
                alert('Error processing download. Please contact support.')
              })
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        })
        .catch(error => {
          console.error('Payment capture error:', error)
          alert('Error processing payment. Please contact support.')
        })
    }
  }, [])

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

  const submitComment = async (songId: string) => {
    const blob = audioBlobs[songId]
    if (!blob) {
      alert('No voice comment recorded.')
      return
    }

    try {
      // Convert blob to base64
      const reader = new FileReader()
      reader.onload = () => {
        const base64Audio = reader.result as string
        
        // Add comment to local state
        setComments(prev => ({
          ...prev,
          [songId]: [...(prev[songId] || []), { audioData: base64Audio, timestamp: new Date() }]
        }))

        // Clear the recording UI
        setAudioBlobs(prev => {
          const newBlobs = { ...prev }
          delete newBlobs[songId]
          return newBlobs
        })
        setShowPlayback(prev => ({
          ...prev,
          [songId]: false
        }))

        alert('Voice comment saved!')
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
    setShowPlayback(prev => ({
      ...prev,
      [songId]: false
    }))
    setIsRecording(prev => ({
      ...prev,
      [songId]: false
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32 container mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Music
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          Alternative • Acoustic
        </p>
        <p className="text-base md:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
          Musician, songwriter, and creator
        </p>
      </section>

      {/* Album Selection Bar */}
      {selectedSongs.size > 0 && (
        <div className="sticky top-0 z-50 bg-[#E55A2B] text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <span className="font-semibold">{selectedSongs.size} song{selectedSongs.size !== 1 ? 's' : ''} selected</span>
              <span className="ml-4 text-sm opacity-90">
                {selectedSongs.size === 10 ? 'Custom Album - $15' : `$${selectedSongs.size * 3} total`}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSongs(new Set())}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={selectedSongs.size > 10 || processingPayment}
                className="px-6 py-2 bg-white text-[#E55A2B] font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {selectedSongs.size === 10 ? 'Create Album ($15)' : `Purchase ${selectedSongs.size} Song${selectedSongs.size !== 1 ? 's' : ''} ($${selectedSongs.size * 3})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music Section */}
      <main className="container mx-auto px-4 md:px-0 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading songs...</p>
          </div>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {songs.map((song) => {
              const isFlipped = flippedCards[song.id] || false
              const isPlaying = currentlyPlaying === song.id
              const songComments = comments[song.id] || []
              
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
                    <div className="absolute inset-0 bg-white border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all backface-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#E55A2B] transition-colors">
                          {song.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSongSelection(song.id)
                            }}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              selectedSongs.has(song.id)
                                ? 'bg-[#E55A2B] border-[#E55A2B] text-white'
                                : 'border-gray-300 hover:border-[#E55A2B]'
                            }`}
                            title="Select for album"
                          >
                            {selectedSongs.has(song.id) && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {song.audio_url ? (
                        <div className="mb-6">
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <button 
                                className="w-10 h-10 bg-[#E55A2B] text-white rounded-full flex items-center justify-center hover:bg-[#D14A1B] transition-colors"
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
                                <div className="text-gray-900 font-medium text-sm">{song.title}</div>
                                <div className="text-gray-500 text-xs">
                                  {isPlaying ? 'Now Playing' : 'Click to play'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Custom Progress Bar */}
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-[#E55A2B] h-2 rounded-full transition-all duration-100 ease-out"
                                  style={{ width: '0%' }}
                                  id={`progress-${song.id}`}
                                />
                              </div>
                              <div 
                                className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
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
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5 text-gray-600"
                              >
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-gray-600 font-medium text-sm">No audio uploaded</div>
                              <div className="text-gray-500 text-xs">Audio file not available</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comments Count */}
                      {songComments.length > 0 && (
                        <div className="mb-4 text-sm text-gray-600">
                          {songComments.length} comment{songComments.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* Download Button */}
                      <div className="mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadSong(song.id)
                          }}
                          disabled={processingPayment}
                          className="w-full bg-[#E55A2B] hover:bg-[#D14A1B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          {processingPayment ? 'Processing...' : 'Download ($3)'}
                        </button>
                      </div>

                      {/* Flip Hint */}
                      <div className="text-center text-gray-500 text-sm mt-4">
                        Click card to {songComments.length > 0 ? 'view comments' : 'add comment'}
                      </div>
                    </div>

                    {/* Back of Card - Voice Comment */}
                    <div className="absolute inset-0 bg-white border border-gray-200 p-6 rounded-2xl shadow-lg rotate-y-180 backface-hidden">
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">Voice Comments</h3>
                          {isRecording[song.id] && (
                            <div className="flex items-center gap-2 text-red-500">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-sm">Recording</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto mb-4">
                          {/* Existing Comments */}
                          {songComments.length > 0 && (
                            <div className="mb-4 space-y-2">
                              {songComments.map((comment, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {comment.timestamp.toLocaleDateString()}
                                  </div>
                                  <audio 
                                    controls 
                                    src={comment.audioData}
                                    className="w-full"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Recording Interface */}
                          {!audioBlobs[song.id] && !isRecording[song.id] ? (
                            <div className="text-gray-600 text-center py-8">
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
                                className="bg-[#E55A2B] hover:bg-[#D14A1B] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                              >
                                Start Comment
                              </button>
                            </div>
                          ) : isRecording[song.id] ? (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-4">🔴</div>
                              <div className="text-lg font-semibold mb-2 text-red-500">Recording...</div>
                              <div className="text-sm text-gray-500 mb-6">
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
                              <div className="text-lg font-semibold mb-2 text-green-600">Recording Complete!</div>
                              <div className="text-sm text-gray-500 mb-6">
                                Listen to your comment about &quot;{song.title}&quot;
                              </div>
                              <div className="space-y-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    playBackRecording(song.id)
                                  }}
                                  disabled={isPlayingBack[song.id]}
                                  className="w-full bg-[#E55A2B] hover:bg-[#D14A1B] disabled:bg-[#B83A0B] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                  {isPlayingBack[song.id] ? 'Playing...' : 'Play Recording'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    submitComment(song.id)
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                  Save Comment
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
                        
                        <div className="text-center text-gray-500 text-sm">
                          {isRecording[song.id] ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Music coming soon...</p>
            <p className="text-gray-400 text-sm">
              Songs will appear here with audio players and voice comment functionality
            </p>
          </div>
        )}

        {/* Album Modal */}
        {showAlbumModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create Custom Album</h2>
              <p className="text-gray-600 mb-6">
                You've selected {selectedSongs.size} song{selectedSongs.size !== 1 ? 's' : ''}. 
                {selectedSongs.size === 10 ? (
                  <span className="block mt-2 font-semibold text-[#E55A2B]">Special Album Price: $15 (Save $15!)</span>
                ) : (
                  <span className="block mt-2">Total: ${selectedSongs.size * 3}</span>
                )}
              </p>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {Array.from(selectedSongs).map(songId => {
                  const song = songs.find(s => s.id === songId)
                  return song ? (
                    <div key={songId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{song.title}</span>
                      <button
                        onClick={() => toggleSongSelection(songId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlbumModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseAlbum}
                  disabled={processingPayment}
                  className="flex-1 px-4 py-2 bg-[#E55A2B] text-white rounded-lg hover:bg-[#D14A1B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingPayment ? 'Processing...' : `Purchase $${selectedSongs.size === 10 ? '15' : selectedSongs.size * 3}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
