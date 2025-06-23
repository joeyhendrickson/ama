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

export default function ArtistDashboard() {
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [voiceComments, setVoiceComments] = useState<VoiceComment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [playingComment, setPlayingComment] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'comments' | 'purchases' | 'payouts'>('overview')
  
  // Song upload state
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    songTitle: '',
    genre: '',
    songFile: null as File | null
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
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
        router.push('/login')
        return
      }

      setArtist(artistData)
      await fetchVoiceComments(artistData.id)
      await fetchPurchases(artistData.id)
      await fetchSongs(artistData.id)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchVoiceComments = async (artistId: string) => {
    const { data, error } = await supabase
      .from('voice_comments')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVoiceComments(data)
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
    if (!uploadForm.songTitle || !uploadForm.songFile || !artist) {
      alert('Please fill in all fields')
      return
    }

    const formData = new FormData()
    formData.append('songFile', uploadForm.songFile)
    formData.append('artistId', artist.id)
    formData.append('songTitle', uploadForm.songTitle)
    formData.append('genre', uploadForm.genre)

    try {
      const response = await fetch('/api/artist/upload-song', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Song uploaded successfully!')
        setUploadForm({ songTitle: '', genre: '', songFile: null })
        setUploading(false)
        await fetchSongs(artist.id)
      } else {
        alert(result.message || 'Error uploading song')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading song')
    }
  }

  const submitSongForApproval = async (songId: string) => {
    if (!artist) return

    try {
      const response = await fetch('/api/artist/submit-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          artistId: artist.id
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Song submitted for approval!')
        await fetchSongs(artist.id)
      } else {
        alert(result.message || 'Error submitting song')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error submitting song')
    }
  }

  const removeSongFromPublic = async (songId: string) => {
    if (!artist) return

    if (!confirm('Are you sure you want to remove this song from public view? Vote count will be preserved.')) {
      return
    }

    try {
      const response = await fetch('/api/artist/remove-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          artistId: artist.id
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(`Song removed from public view. ${result.preservedVotes} votes have been preserved.`)
        await fetchSongs(artist.id)
      } else {
        alert(result.message || 'Error removing song')
      }
    } catch (error) {
      console.error('Remove error:', error)
      alert('Error removing song')
    }
  }

  const deletePrivateSong = async (songId: string) => {
    if (!artist) return

    if (!confirm('Are you sure you want to delete this song? This action cannot be undone and will permanently remove the song and its file.')) {
      return
    }

    try {
      const response = await fetch('/api/artist/delete-song', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          artistId: artist.id
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Song deleted successfully!')
        await fetchSongs(artist.id)
      } else {
        alert(result.message || 'Error deleting song')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Error deleting song')
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
        <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'songs', label: 'Songs', icon: '🎵' },
            { id: 'comments', label: 'Voice Comments', icon: '🎤' },
            { id: 'purchases', label: 'Purchases', icon: '💰' },
            { id: 'payouts', label: 'Payouts', icon: '💳' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
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
                <div className="text-gray-600 text-sm mb-2">Recent Activity</div>
                <div className="text-3xl font-bold text-gray-900">
                  {voiceComments.filter(c => 
                    new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <div className="text-gray-600 text-sm mt-2">Last 7 days</div>
              </div>
            </div>
          )}

          {/* Songs Tab */}
          {activeTab === 'songs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Song Management</h2>
              
              {/* Song upload form */}
              {uploading ? (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Upload New Song</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Song Title"
                      value={uploadForm.songTitle}
                      onChange={(e) => setUploadForm({ ...uploadForm, songTitle: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Genre (e.g., Pop, Rock, Electronic)"
                      value={uploadForm.genre}
                      onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm">Audio File (MP3, max 20MB)</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            const file = e.target.files[0]
                            setUploadForm({ ...uploadForm, songFile: file })
                          }
                        }}
                        className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSongUpload}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Upload Song
                      </button>
                      <button
                        onClick={() => {
                          setUploading(false)
                          setUploadForm({ songTitle: '', genre: '', songFile: null })
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setUploading(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  + Upload New Song
                </button>
              )}

              {/* Private Songs */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Private Songs ({songs.filter(s => !s.is_public && !s.submitted_for_approval).length})</h3>
                  <p className="text-gray-600 text-sm mt-1">Songs in your private storage</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Genre</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Uploaded</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {songs.filter(s => !s.is_public && !s.submitted_for_approval).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No private songs. Upload your first song above!
                          </td>
                        </tr>
                      ) : (
                        songs.filter(s => !s.is_public && !s.submitted_for_approval).map((song) => (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-semibold">{song.title}</td>
                            <td className="px-6 py-4 text-gray-600">{song.genre || 'Unknown'}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(song.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => submitSongForApproval(song.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm mr-2"
                              >
                                Submit for Approval
                              </button>
                              <button
                                onClick={() => deletePrivateSong(song.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Approval */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Pending Approval ({songs.filter(s => s.submitted_for_approval && s.status === 'pending').length})</h3>
                  <p className="text-gray-600 text-sm mt-1">Songs submitted for admin review</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Genre</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Submitted</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {songs.filter(s => s.submitted_for_approval && s.status === 'pending').length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No songs pending approval
                          </td>
                        </tr>
                      ) : (
                        songs.filter(s => s.submitted_for_approval && s.status === 'pending').map((song) => (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-semibold">{song.title}</td>
                            <td className="px-6 py-4 text-gray-600">{song.genre}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(song.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-600 text-white">
                                Pending Review
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Public Songs */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Public Songs ({songs.filter(s => s.is_public && s.status === 'approved').length})</h3>
                  <p className="text-gray-600 text-sm mt-1">Songs visible on your public artist page</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Title</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Genre</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Votes</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Target</th>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {songs.filter(s => s.is_public && s.status === 'approved').length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No public songs yet
                          </td>
                        </tr>
                      ) : (
                        songs.filter(s => s.is_public && s.status === 'approved').map((song) => (
                          <tr key={song.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-semibold">{song.title}</td>
                            <td className="px-6 py-4 text-gray-600">{song.genre}</td>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

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
              <h2 className="text-2xl font-bold text-gray-900">Payouts & Stripe Integration</h2>
              
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
                {artist.stripe_account_id ? (
                  <div className="text-center">
                    <div className="text-green-600 text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Stripe Account Connected!</h3>
                    <p className="text-gray-600 mb-6">
                      Your Stripe account is connected and ready to receive payouts.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                      View Stripe Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-orange-600 text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Stripe Account</h3>
                    <p className="text-gray-600 mb-6">
                      Connect your Stripe account to start receiving payouts from your song votes and voice comments.
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 