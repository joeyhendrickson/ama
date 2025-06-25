'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

interface Artist {
  id: string
  name: string
  email: string
  image_url: string
  bio: string
  stripe_account_id?: string
}

interface Song {
  id: string
  title: string
  genre?: string
  file_url?: string
  file_size?: number
  status?: string
  is_public?: boolean
  submitted_for_approval?: boolean
  current_votes: number
  vote_goal: number
  original_vote_count: number
  created_at: string
  removed_at?: string
}

interface VoiceComment {
  id: string
  song_id: string
  song_title: string
  artist_name: string
  audio_data: string
  audio_filename: string
  status: 'draft' | 'purchased' | 'sent'
  purchase_session_id?: string
  created_at: string
  updated_at: string
}

interface Purchase {
  session_id: string
  total_amount: number
  song_count: number
  comment_count: number
  created_at: string
}

interface ArtistRevenue {
  total_revenue: number
  total_payouts: number
  pending_payouts: number
  platform_fees: number
}

export default function ArtistDashboard() {
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [voiceComments, setVoiceComments] = useState<VoiceComment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [revenue, setRevenue] = useState<ArtistRevenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [playingComment, setPlayingComment] = useState<string | null>(null)
  const [processingPayouts, setProcessingPayouts] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('email', user.email)
        .single()

      if (artistError || !artistData) {
        console.error('Artist not found:', artistError)
        router.push('/')
        return
      }

      setArtist(artistData)

      // Fetch all data
      await Promise.all([
        fetchSongs(artistData.id),
        fetchVoiceComments(artistData.id),
        fetchPurchases(artistData.id),
        fetchRevenue(artistData.id)
      ])

    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenue = async (artistId: string) => {
    const { data, error } = await supabase
      .from('artist_revenue')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    if (!error && data) {
      setRevenue(data)
    } else {
      // Create default revenue record if none exists
      setRevenue({
        total_revenue: 0,
        total_payouts: 0,
        pending_payouts: 0,
        platform_fees: 0
      })
    }
  }

  const fetchVoiceComments = async (artistId: string) => {
    const { data, error } = await supabase
      .from('voice_comments')
      .select(`
        *,
        songs!inner(title)
      `)
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const comments = data.map(comment => ({
        ...comment,
        song_title: comment.songs?.title || 'Unknown Song'
      }))
      setVoiceComments(comments)
    }
  }

  const fetchPurchases = async (artistId: string) => {
    const { data, error } = await supabase
      .from('voice_comments')
      .select('purchase_session_id, created_at')
      .eq('artist_id', artistId)
      .eq('status', 'purchased')
      .not('purchase_session_id', 'is', null)

    if (!error && data) {
      // Group by purchase session
      const purchaseMap = new Map<string, Purchase>()
      
      data.forEach(comment => {
        const sessionId = comment.purchase_session_id!
        if (!purchaseMap.has(sessionId)) {
          purchaseMap.set(sessionId, {
            session_id: sessionId,
            total_amount: 0, // We'll need to get this from Stripe
            song_count: 0,
            comment_count: 0,
            created_at: comment.created_at
          })
        }
        purchaseMap.get(sessionId)!.comment_count++
      })

      setPurchases(Array.from(purchaseMap.values()))
    }
  }

  const fetchSongs = async (artistId: string) => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSongs(data)
    }
  }

  const handleSongUpload = async () => {
    // Implementation for song upload
    console.log('Song upload functionality')
  }

  const submitSongForApproval = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ submitted_for_approval: true })
        .eq('id', songId)

      if (error) {
        console.error('Error submitting song:', error)
        alert('Failed to submit song for approval')
      } else {
        // Refresh songs list
        if (artist) {
          fetchSongs(artist.id)
        }
        alert('Song submitted for approval!')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit song for approval')
    }
  }

  const removeSongFromPublic = async (songId: string) => {
    try {
      const song = songs.find(s => s.id === songId)
      if (!song) return

      const { error } = await supabase
        .from('songs')
        .update({ 
          is_public: false, 
          original_vote_count: song.current_votes,
          removed_at: new Date().toISOString()
        })
        .eq('id', songId)

      if (error) {
        console.error('Error removing song:', error)
        alert('Failed to remove song from public')
      } else {
        // Refresh songs list
        if (artist) {
          fetchSongs(artist.id)
        }
        alert('Song removed from public view')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to remove song from public')
    }
  }

  const deletePrivateSong = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)

      if (error) {
        console.error('Error deleting song:', error)
        alert('Failed to delete song')
      } else {
        // Refresh songs list
        if (artist) {
          fetchSongs(artist.id)
        }
        alert('Song deleted successfully')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete song')
    }
  }

  const handlePlayVoiceComment = (commentId: string, audioData: string) => {
    if (playingComment === commentId) {
      setPlayingComment(null)
      return
    }

    // Stop any currently playing audio
    if (playingComment) {
      setPlayingComment(null)
    }

    // Create and play audio
    const audio = new Audio(audioData)
    audio.onended = () => setPlayingComment(null)
    audio.play()
    setPlayingComment(commentId)
  }

  const connectStripeAccount = async () => {
    try {
      const response = await fetch('/api/stripe/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: artist?.id,
          email: artist?.email
        }),
      })

      if (response.ok) {
        const { accountLink } = await response.json()
        window.location.href = accountLink
      } else {
        alert('Failed to create Stripe account link')
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error)
      alert('Error connecting Stripe account')
    }
  }

  const processPendingPayouts = async () => {
    if (!artist?.id) return

    setProcessingPayouts(true)
    try {
      const response = await fetch('/api/stripe/process-pending-payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: artist.id
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Successfully processed ${result.processedCount} pending payouts!`)
        // Refresh revenue data
        await fetchRevenue(artist.id)
      } else {
        alert(`Failed to process payouts: ${result.message}`)
      }
    } catch (error) {
      console.error('Error processing payouts:', error)
      alert('Error processing pending payouts')
    } finally {
      setProcessingPayouts(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Artist not found</div>
      </div>
    )
  }

  const purchasedComments = voiceComments.filter(c => c.status === 'purchased')

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div className="flex items-center gap-6 mb-6 lg:mb-0">
            {artist.image_url && (
              <div className="relative w-20 h-20 overflow-hidden rounded-full">
                <Image
                  src={artist.image_url}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{artist.name}</h1>
              <p className="text-gray-600">{artist.email}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!artist.stripe_account_id && (
              <button
                onClick={connectStripeAccount}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Connect Stripe
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Site
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'songs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Songs ({songs.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'comments' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Voice Comments ({voiceComments.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'purchases' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Purchases ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'payouts' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Payouts & Earnings
          </button>
        </div>

        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                <div className="text-gray-600 text-sm mb-2">Total Voice Comments</div>
                <div className="text-3xl font-bold text-gray-900">{voiceComments.length}</div>
                <div className="text-green-600 text-sm mt-2">
                  {purchasedComments.length} purchased
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                <div className="text-gray-600 text-sm mb-2">Purchases</div>
                <div className="text-3xl font-bold text-gray-900">{purchases.length}</div>
                <div className="text-gray-600 text-sm mt-2">Total sessions</div>
              </div>
              
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                <div className="text-gray-600 text-sm mb-2">Stripe Connected</div>
                <div className="text-3xl font-bold text-gray-900">
                  {artist.stripe_account_id ? '✅' : '❌'}
                </div>
                <div className="text-gray-600 text-sm mt-2">
                  {artist.stripe_account_id ? 'Ready for payouts' : 'Not connected'}
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                <div className="text-gray-600 text-sm mb-2">Total Revenue</div>
                <div className="text-3xl font-bold text-gray-900">
                  ${revenue?.total_revenue?.toFixed(2) || '0.00'}
                </div>
                <div className="text-green-600 text-sm mt-2">
                  ${revenue?.total_payouts?.toFixed(2) || '0.00'} paid out
                </div>
              </div>
            </div>
          )}

          {/* Songs Tab */}
          {activeTab === 'songs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Songs</h2>
                <button
                  onClick={handleSongUpload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Upload New Song
                </button>
              </div>

              {/* Public Songs */}
              {songs.filter(s => s.is_public).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Public Songs ({songs.filter(s => s.is_public).length})</h3>
                    <p className="text-gray-600 text-sm mt-1">Songs currently visible to fans</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Genre</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Votes</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Goal</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {songs.filter(s => s.is_public).map((song) => (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-semibold">{song.title}</td>
                            <td className="px-6 py-4 text-gray-600">{song.genre || 'N/A'}</td>
                            <td className="px-6 py-4 text-green-600 font-semibold">{song.current_votes}</td>
                            <td className="px-6 py-4 text-gray-600">{song.vote_goal}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => removeSongFromPublic(song.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Remove from Public
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Removed Songs (with preserved votes) */}
              {songs.filter(s => !s.is_public && s.original_vote_count > 0).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Removed Songs ({songs.filter(s => !s.is_public && s.original_vote_count > 0).length})</h3>
                    <p className="text-gray-600 text-sm mt-1">Songs removed from public view with preserved votes</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Preserved Votes</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Removed</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {songs.filter(s => !s.is_public && s.original_vote_count > 0).map((song) => (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-semibold">{song.title}</td>
                            <td className="px-6 py-4 text-green-600 font-semibold">{song.original_vote_count}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {song.removed_at ? new Date(song.removed_at).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => submitSongForApproval(song.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Re-submit for Approval
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Private Songs */}
              {songs.filter(s => !s.is_public && s.original_vote_count === 0).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Private Songs ({songs.filter(s => !s.is_public && s.original_vote_count === 0).length})</h3>
                    <p className="text-gray-600 text-sm mt-1">Songs not yet submitted for approval</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Genre</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                          <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {songs.filter(s => !s.is_public && s.original_vote_count === 0).map((song) => (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-semibold">{song.title}</td>
                            <td className="px-6 py-4 text-gray-600">{song.genre || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                song.submitted_for_approval ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {song.submitted_for_approval ? 'Pending Approval' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {!song.submitted_for_approval && (
                                  <button
                                    onClick={() => submitSongForApproval(song.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Submit for Approval
                                  </button>
                                )}
                                <button
                                  onClick={() => deletePrivateSong(song.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Voice Comments</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    All ({voiceComments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Purchased ({purchasedComments.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {voiceComments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{comment.song_title}</h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        comment.status === 'purchased' ? 'bg-green-600 text-white' :
                        comment.status === 'sent' ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {comment.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handlePlayVoiceComment(comment.id, comment.audio_data)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {playingComment === comment.id ? (
                          <>
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            Playing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            Play
                          </>
                        )}
                      </button>
                      
                      <div className="text-gray-600 text-sm">
                        {comment.audio_filename}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {purchases.map((purchase) => (
                  <div key={purchase.session_id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Purchase Session</h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-green-600 font-bold">
                        ${purchase.total_amount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Session ID: {purchase.session_id.slice(-8)}...</div>
                      <div>Voice Comments: {purchase.comment_count}</div>
                      <div>Songs: {purchase.song_count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Payouts & Earnings</h2>
              
              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                  <div className="text-gray-600 text-sm mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${revenue?.total_revenue?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">From all purchases</div>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                  <div className="text-gray-600 text-sm mb-2">Total Payouts</div>
                  <div className="text-3xl font-bold text-green-600">
                    ${revenue?.total_payouts?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">Successfully transferred</div>
                </div>
                
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                  <div className="text-gray-600 text-sm mb-2">Pending Payouts</div>
                  <div className="text-3xl font-bold text-orange-600">
                    ${revenue?.pending_payouts?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">Waiting for Stripe connection</div>
                </div>
              </div>

              {/* Stripe Connection Status */}
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
                {artist.stripe_account_id ? (
                  <div className="text-center">
                    <div className="text-green-600 text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Stripe Account Connected!</h3>
                    <p className="text-gray-600 mb-6">
                      Your Stripe account is connected and ready to receive payouts. You get paid immediately when fans purchase rocket fuel!
                    </p>
                    
                    {revenue && revenue.pending_payouts > 0 && (
                      <div className="mb-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                          <p className="text-orange-800 font-medium">
                            You have ${revenue.pending_payouts.toFixed(2)} in pending payouts from before you connected your Stripe account.
                          </p>
                        </div>
                        <button
                          onClick={processPendingPayouts}
                          disabled={processingPayouts}
                          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                          {processingPayouts ? 'Processing...' : 'Process Pending Payouts'}
                        </button>
                      </div>
                    )}
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                      View Stripe Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-orange-600 text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Stripe Account</h3>
                    <p className="text-gray-600 mb-6">
                      Connect your Stripe account to start receiving immediate payouts from your song votes and voice comments. 
                      You get paid every time someone adds rocket fuel!
                    </p>
                    <button
                      onClick={connectStripeAccount}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg"
                    >
                      Connect Stripe Account
                    </button>
                  </div>
                )}
              </div>

              {/* How It Works */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">How Immediate Payouts Work</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                    <p>Fans purchase rocket fuel for your songs through Stripe Checkout</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                    <p>Our system immediately calculates your share (90% after platform fees)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                    <p>If your Stripe account is connected, funds are transferred to your account instantly</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                    <p>If not connected, funds are held until you connect your Stripe account</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 