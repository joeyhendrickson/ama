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
  const [voiceComments, setVoiceComments] = useState<VoiceComment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [playingComment, setPlayingComment] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'purchases' | 'payouts'>('overview')

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
      <div className="min-h-screen bg-[#040a12] flex items-center justify-center">
        <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-8 rounded-2xl">
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return null
  }

  const purchasedComments = voiceComments.filter(c => c.status === 'purchased' || c.status === 'sent')
  const draftComments = voiceComments.filter(c => c.status === 'draft')

  return (
    <div className="min-h-screen bg-[#040a12]">
      {/* Header */}
      <div className="bg-blue-800/20 backdrop-blur-md border-b border-blue-400/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {artist.image_url ? (
                <div className="relative w-16 h-16 overflow-hidden rounded-full">
                  <Image
                    src={artist.image_url}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center text-blue-200 text-xl font-bold">
                  {artist.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{artist.name}</h1>
                <p className="text-blue-300 text-sm">Artist Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Site
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-blue-900/30 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
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
                  : 'text-blue-300 hover:text-white hover:bg-blue-800/50'
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
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                <div className="text-blue-300 text-sm mb-2">Total Voice Comments</div>
                <div className="text-3xl font-bold text-white">{voiceComments.length}</div>
                <div className="text-green-400 text-sm mt-2">
                  {purchasedComments.length} purchased
                </div>
              </div>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                <div className="text-blue-300 text-sm mb-2">Purchases</div>
                <div className="text-3xl font-bold text-white">{purchases.length}</div>
                <div className="text-blue-300 text-sm mt-2">Total sessions</div>
              </div>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                <div className="text-blue-300 text-sm mb-2">Stripe Connected</div>
                <div className="text-3xl font-bold text-white">
                  {artist.stripe_account_id ? '✅' : '❌'}
                </div>
                <div className="text-blue-300 text-sm mt-2">
                  {artist.stripe_account_id ? 'Ready for payouts' : 'Not connected'}
                </div>
              </div>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                <div className="text-blue-300 text-sm mb-2">Recent Activity</div>
                <div className="text-3xl font-bold text-white">
                  {voiceComments.filter(c => 
                    new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <div className="text-blue-300 text-sm mt-2">Last 7 days</div>
              </div>
            </div>
          )}

          {/* Voice Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Voice Comments</h2>
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
                  <div key={comment.id} className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{comment.song_title}</h3>
                        <p className="text-blue-300 text-sm">
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
                      
                      <div className="text-blue-300 text-sm">
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
              <h2 className="text-2xl font-bold text-white">Purchase History</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {purchases.map((purchase) => (
                  <div key={purchase.session_id} className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Purchase Session</h3>
                        <p className="text-blue-300 text-sm">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-green-400 font-bold">
                        ${purchase.total_amount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-blue-300">
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
              <h2 className="text-2xl font-bold text-white">Payouts & Stripe Integration</h2>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-8 rounded-2xl">
                {artist.stripe_account_id ? (
                  <div className="text-center">
                    <div className="text-green-400 text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-white mb-2">Stripe Account Connected!</h3>
                    <p className="text-blue-300 mb-6">
                      Your Stripe account is connected and ready to receive payouts.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                      View Stripe Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-orange-400 text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-white mb-2">Connect Your Stripe Account</h3>
                    <p className="text-blue-300 mb-6">
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