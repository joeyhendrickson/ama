'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Analytics {
  totalArtists: number
  totalSongs: number
  totalVoiceComments: number
  totalPurchases: number
  totalRevenue: number
  recentVisitors: number
  activeSongs: number
  pendingSongs: number
}

interface VoiceComment {
  id: string
  song_title: string
  artist_name: string
  status: 'draft' | 'purchased' | 'sent'
  created_at: string
  purchase_session_id?: string
}

interface Purchase {
  session_id: string
  total_amount: number
  comment_count: number
  created_at: string
  customer_email?: string
}

interface Artist {
  id: string
  name: string
  email: string
  created_at: string
  stripe_account_id?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [voiceComments, setVoiceComments] = useState<VoiceComment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'purchases' | 'artists' | 'analytics' | 'approvals'>('overview')

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

      // Check if user is admin
      const isAdmin = user.email?.includes('admin') || user.email?.includes('launchthatsong.com')
      if (!isAdmin) {
        router.push('/login')
        return
      }

      await fetchAnalytics()
      await fetchVoiceComments()
      await fetchPurchases()
      await fetchArtists()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      // Get total counts
      const [artistsResult, songsResult, commentsResult] = await Promise.all([
        supabase.from('artists').select('id', { count: 'exact' }),
        supabase.from('songs').select('id', { count: 'exact' }),
        supabase.from('voice_comments').select('id', { count: 'exact' })
      ])

      // Get purchase data
      const { data: purchaseData } = await supabase
        .from('voice_comments')
        .select('purchase_session_id')
        .eq('status', 'purchased')
        .not('purchase_session_id', 'is', null)

      const uniquePurchases = new Set(purchaseData?.map(p => p.purchase_session_id) || []).size

      // Get song status counts
      const { data: songStatusData } = await supabase
        .from('songs')
        .select('status')

      const activeSongs = songStatusData?.filter(s => s.status === 'active').length || 0
      const pendingSongs = songStatusData?.filter(s => s.status === 'pending').length || 0

      setAnalytics({
        totalArtists: artistsResult.count || 0,
        totalSongs: songsResult.count || 0,
        totalVoiceComments: commentsResult.count || 0,
        totalPurchases: uniquePurchases,
        totalRevenue: uniquePurchases * 5, // Assuming $5 per purchase
        recentVisitors: Math.floor(Math.random() * 100) + 50, // Placeholder
        activeSongs,
        pendingSongs
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchVoiceComments = async () => {
    const { data, error } = await supabase
      .from('voice_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setVoiceComments(data)
    }
  }

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('voice_comments')
      .select('purchase_session_id, created_at')
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
            total_amount: 5, // Placeholder
            comment_count: 0,
            created_at: comment.created_at
          })
        }
        purchaseMap.get(sessionId)!.comment_count++
      })

      setPurchases(Array.from(purchaseMap.values()))
    }
  }

  const fetchArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setArtists(data)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040a12] flex items-center justify-center">
        <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-8 rounded-2xl">
          <p className="text-white text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#040a12]">
      {/* Header */}
      <div className="bg-blue-800/20 backdrop-blur-md border-b border-blue-400/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-800/50 rounded-full flex items-center justify-center text-purple-200 text-xl font-bold">
                👑
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-300 text-sm">Launch That Song Platform Management</p>
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
            { id: 'artists', label: 'Artists', icon: '🎵' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'approvals', label: 'Approvals', icon: '✅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
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
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <div className="text-blue-300 text-sm mb-2">Total Artists</div>
                  <div className="text-3xl font-bold text-white">{analytics.totalArtists}</div>
                  <div className="text-green-400 text-sm mt-2">Registered artists</div>
                </div>
                
                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <div className="text-blue-300 text-sm mb-2">Total Songs</div>
                  <div className="text-3xl font-bold text-white">{analytics.totalSongs}</div>
                  <div className="text-blue-300 text-sm mt-2">
                    {analytics.activeSongs} active, {analytics.pendingSongs} pending
                  </div>
                </div>
                
                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <div className="text-blue-300 text-sm mb-2">Voice Comments</div>
                  <div className="text-3xl font-bold text-white">{analytics.totalVoiceComments}</div>
                  <div className="text-green-400 text-sm mt-2">
                    {voiceComments.filter(c => c.status === 'purchased').length} purchased
                  </div>
                </div>
                
                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <div className="text-blue-300 text-sm mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-white">${analytics.totalRevenue}</div>
                  <div className="text-green-400 text-sm mt-2">
                    {analytics.totalPurchases} purchases
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Recent Visitors</span>
                      <span className="text-white font-semibold">{analytics.recentVisitors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Active Songs</span>
                      <span className="text-green-400 font-semibold">{analytics.activeSongs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Pending Songs</span>
                      <span className="text-yellow-400 font-semibold">{analytics.pendingSongs}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Review Pending Songs
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                      View All Artists
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Export Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Voice Comments</h2>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    All ({voiceComments.length})
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                    Purchased ({voiceComments.filter(c => c.status === 'purchased').length})
                  </button>
                </div>
              </div>

              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-900/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Song</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Artist</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Status</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Date</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/30">
                      {voiceComments.map((comment) => (
                        <tr key={comment.id} className="hover:bg-blue-700/10">
                          <td className="px-6 py-4 text-white">{comment.song_title}</td>
                          <td className="px-6 py-4 text-blue-300">{comment.artist_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              comment.status === 'purchased' ? 'bg-green-600 text-white' :
                              comment.status === 'sent' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-gray-300'
                            }`}>
                              {comment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-blue-300">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Purchase History</h2>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-900/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Session ID</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Amount</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Comments</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Date</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/30">
                      {purchases.map((purchase) => (
                        <tr key={purchase.session_id} className="hover:bg-blue-700/10">
                          <td className="px-6 py-4 text-white font-mono text-sm">
                            {purchase.session_id.slice(-8)}...
                          </td>
                          <td className="px-6 py-4 text-green-400 font-semibold">
                            ${purchase.total_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-blue-300">
                            {purchase.comment_count}
                          </td>
                          <td className="px-6 py-4 text-blue-300">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Artists Tab */}
          {activeTab === 'artists' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Artist Management</h2>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-900/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Name</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Email</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Stripe Connected</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Joined</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/30">
                      {artists.map((artist) => (
                        <tr key={artist.id} className="hover:bg-blue-700/10">
                          <td className="px-6 py-4 text-white font-semibold">{artist.name}</td>
                          <td className="px-6 py-4 text-blue-300">{artist.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              artist.stripe_account_id ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}>
                              {artist.stripe_account_id ? 'Connected' : 'Not Connected'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-blue-300">
                            {new Date(artist.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-400 hover:text-blue-300 text-sm mr-3">
                              View Profile
                            </button>
                            <button className="text-purple-400 hover:text-purple-300 text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Revenue Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Total Revenue</span>
                      <span className="text-green-400 font-bold text-xl">${analytics?.totalRevenue || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Average Purchase</span>
                      <span className="text-white font-semibold">$5.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Conversion Rate</span>
                      <span className="text-green-400 font-semibold">85%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Engagement Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Total Comments</span>
                      <span className="text-white font-bold text-xl">{analytics?.totalVoiceComments || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Purchased Comments</span>
                      <span className="text-green-400 font-semibold">
                        {voiceComments.filter(c => c.status === 'purchased').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Active Artists</span>
                      <span className="text-blue-400 font-semibold">{analytics?.totalArtists || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Platform Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
                    <div className="text-blue-300 text-sm">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">2.3s</div>
                    <div className="text-blue-300 text-sm">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">1.2k</div>
                    <div className="text-blue-300 text-sm">Monthly Visitors</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
              
              <div className="bg-blue-800/20 backdrop-blur-md border border-blue-400/30 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-900/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Song</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Artist</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Status</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Date</th>
                        <th className="px-6 py-3 text-left text-blue-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/30">
                      {voiceComments.map((comment) => (
                        <tr key={comment.id} className="hover:bg-blue-700/10">
                          <td className="px-6 py-4 text-white">{comment.song_title}</td>
                          <td className="px-6 py-4 text-blue-300">{comment.artist_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              comment.status === 'purchased' ? 'bg-green-600 text-white' :
                              comment.status === 'sent' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-gray-300'
                            }`}>
                              {comment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-blue-300">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 