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
  audio_data?: string
  audio_filename?: string
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
  status?: string
  bio?: string
}

interface Song {
  id: string
  title: string
  artist_name: string
  created_at: string
  status?: string
}

interface ApprovalHistory {
  id: string
  item_type: 'song' | 'artist'
  item_id: string
  action: 'approved' | 'rejected' | 'removed'
  admin_user_id?: string
  admin_email?: string
  item_title: string
  item_artist_name: string
  notes?: string
  created_at: string
  vote_goal?: number
  vote_price?: number
}


export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [voiceComments, setVoiceComments] = useState<VoiceComment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [pendingArtists, setPendingArtists] = useState<Artist[]>([])
  const [pendingSongs, setPendingSongs] = useState<Song[]>([])
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'purchases' | 'analytics' | 'approvals' | 'database' | 'music' | 'ontology' | 'personal-content' | 'topics'>('overview')
  const [isUpdatingAI, setIsUpdatingAI] = useState(false)
  const [aiUpdateStatus, setAiUpdateStatus] = useState<string | null>(null)
  
  // Site ontology state
  const [siteOntology, setSiteOntology] = useState<any>(null)
  
  // Personal content state
  const [personalContent, setPersonalContent] = useState<any[]>([])
  const [personalContentForm, setPersonalContentForm] = useState({
    id: '',
    category: '',
    title: '',
    content: '',
    is_published: false
  })

  // Topics state
  const [topics, setTopics] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null)
  const [topicForm, setTopicForm] = useState<any>({
    id: '',
    topic_id: '',
    title: '',
    description: '',
    route: '',
    content: '',
    ontology: {},
    metadata: {},
    is_active: true
  })
  
  // Music management state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist_name: 'Joey Hendrickson',
    genre: 'Alternative • Acoustic',
    file: null as File | null,
    image: null as File | null
  })
  const [uploading, setUploading] = useState(false)
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([])
  
  // Edit artist state

  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioRefs, setAudioRefs] = useState<{ [key: string]: HTMLAudioElement | null }>({})

  // Add state for database tab
  const [dbArtists, setDbArtists] = useState<Artist[]>([])
  const [dbSongs, setDbSongs] = useState<Song[]>([])
  const [artistFilter, setArtistFilter] = useState('')
  const [artistStatusFilter, setArtistStatusFilter] = useState('')
  const [songFilter, setSongFilter] = useState('')
  const [songStatusFilter, setSongStatusFilter] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      // Stop all audio and clean up refs
      Object.values(audioRefs).forEach(audio => {
        if (audio) {
          audio.pause()
          audio.src = ''
        }
      })
    }
  }, [audioRefs])

  const checkAuth = async () => {
    try {
      console.log('Admin dashboard: Checking authentication...')
      
      // Check simple admin session
      const response = await fetch('/api/admin/login', {
        method: 'GET',
        credentials: 'include'
      })
      const authData = await response.json()

      if (!authData.authenticated) {
        console.log('Admin dashboard: Not authenticated, redirecting to login')
        router.push('/admin-login')
        return
      }

      console.log('Admin dashboard: Authenticated, loading data...')

      // Load all dashboard data
      await fetchAnalytics()
      await fetchVoiceComments()
      await fetchPurchases()
      await fetchPendingApprovals()
      await fetchApprovalHistory()
      await fetchUploadedSongs()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/admin-login')
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

      const activeSongs = songStatusData?.filter(s => s.status === 'approved').length || 0
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
      .select('*, audio_data, audio_filename')
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


  const fetchPendingApprovals = async () => {
    // Fetch all non-approved artists for admin review
    const { data: pendingArtistsData } = await supabase
      .from('artists')
      .select('*')
      .neq('status', 'approved')

    console.log('DEBUG: pendingArtistsData', pendingArtistsData)

    if (pendingArtistsData) {
      setPendingArtists(pendingArtistsData)
    }

    // Fetch pending songs with artist names
    const { data: pendingSongsData } = await supabase
      .from('songs')
      .select(`*, artists!inner(name)`)
      .eq('submitted_for_approval', true)
      .eq('status', 'pending')

    if (pendingSongsData) {
      setPendingSongs(pendingSongsData.map(song => ({
        ...song,
        artist_name: song.artists?.name || 'Unknown Artist'
      })))
    }
  }

  const fetchApprovalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching approval history:', error)
        // Don't show error to user if table doesn't exist yet or has permission issues
        if (error.code === '42P01' || error.code === '42501') { // Table doesn't exist or permission denied
          console.log('Approval history table not accessible:', error.message)
          setApprovalHistory([])
          return
        }
        return
      }

      setApprovalHistory(data || [])
    } catch (error) {
      console.error('Error fetching approval history:', error)
      setApprovalHistory([])
    }
  }

  const approveArtist = async (artistId: string) => {
    // Fetch artist details for logging
    const { data: artistData } = await supabase
      .from('artists')
      .select('name, email')
      .eq('id', artistId)
      .single()

    const { error } = await supabase
      .from('artists')
      .update({ status: 'approved' })
      .eq('id', artistId)

    if (!error) {
      // Log to approval history
      if (artistData) {
        await supabase
          .from('approval_history')
          .insert({
            item_type: 'artist',
            item_id: artistId,
            action: 'approved',
            item_title: artistData.name,
            item_artist_name: artistData.name,
            notes: 'Artist approved by admin'
          })
      }
      await fetchPendingApprovals()
      await fetchAnalytics()
      await fetchApprovalHistory()
    }
  }

  const rejectArtist = async (artistId: string) => {
    const { error } = await supabase
      .from('artists')
      .update({ status: 'rejected' })
      .eq('id', artistId)

    if (!error) {
      await fetchPendingApprovals()
      await fetchAnalytics()
      await fetchApprovalHistory()
    }
  }

  const approveSong = async (songId: string) => {
    try {
      console.log('=== APPROVE SONG DEBUG ===')
      console.log('1. Starting approval for songId:', songId)
      
      // Use admin API endpoint to bypass RLS
      console.log('2. Calling admin API endpoint...')
      const response = await fetch('/api/admin/approve-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Admin API error:', result)
        alert('Error approving song: ' + result.message)
        return
      }

      console.log('3. Admin API call successful:', result)

      console.log('4. Refreshing pending approvals...')
      await fetchPendingApprovals()
      
      console.log('=== APPROVAL COMPLETE ===')
      alert('Song approved successfully!')
    } catch (error) {
      console.error('Error in approveSong:', error)
      alert('Error approving song: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const rejectSong = async (songId: string) => {
    try {
      // First, get the song details for logging
      const { data: songData } = await supabase
        .from('songs')
        .select(`
          *,
          artists!inner(name)
        `)
        .eq('id', songId)
        .single()

      // Update the song status
      const { error } = await supabase
        .from('songs')
        .update({ status: 'rejected' })
        .eq('id', songId)

      if (error) {
        console.error('Error rejecting song:', error)
        alert('Error rejecting song: ' + error.message)
        return
      }

      // Log to approval history
      if (songData) {
        await supabase
          .from('approval_history')
          .insert({
            item_type: 'song',
            item_id: songId,
            action: 'rejected',
            item_title: songData.title,
            item_artist_name: songData.artists?.name || 'Unknown Artist',
            notes: 'Rejected by admin'
          })
      }

      await fetchPendingApprovals()
      await fetchAnalytics()
      await fetchApprovalHistory()
    } catch (error) {
      console.error('Error in rejectSong:', error)
      alert('Error rejecting song')
    }
  }


  const playVoiceComment = async (comment: VoiceComment) => {
    if (!comment.audio_data) {
      alert('No audio data available for this comment')
      return
    }

    try {
      // Stop any currently playing audio
      if (playingAudioId && audioRefs[playingAudioId]) {
        audioRefs[playingAudioId]?.pause()
        setPlayingAudioId(null)
      }

      // Create audio element if it doesn't exist
      if (!audioRefs[comment.id]) {
        const audio = new Audio(comment.audio_data)
        audio.onended = () => setPlayingAudioId(null)
        audio.onerror = (e) => {
          console.error('Audio playback error:', e)
          setPlayingAudioId(null)
        }
        setAudioRefs(prev => ({ ...prev, [comment.id]: audio }))
      }

      const audio = audioRefs[comment.id]
      if (audio) {
        if (playingAudioId === comment.id) {
          // Pause if already playing
          audio.pause()
          setPlayingAudioId(null)
        } else {
          // Play the audio
          await audio.play()
          setPlayingAudioId(comment.id)
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      alert('Error playing audio')
    }
  }

  // Fetch all artists and songs for the database tab
  const fetchDatabaseTables = async () => {
    let artistQuery = supabase.from('artists').select('*').order('created_at', { ascending: false })
    if (artistFilter) artistQuery = artistQuery.ilike('email', `%${artistFilter}%`)
    if (artistStatusFilter) artistQuery = artistQuery.eq('status', artistStatusFilter)
    const { data: allArtists } = await artistQuery
    setDbArtists(allArtists || [])

    // Always fetch all songs, regardless of status
    let songQuery = supabase.from('songs').select('*').order('created_at', { ascending: false })
    if (songFilter) songQuery = songQuery.ilike('title', `%${songFilter}%`)
    if (songStatusFilter) songQuery = songQuery.eq('status', songStatusFilter)
    const { data: allSongs, error: songsError } = await songQuery
    console.log('DEBUG: allSongs from Supabase', allSongs, 'error:', songsError);
    setDbSongs(allSongs || [])
  }

  useEffect(() => {
    if (activeTab === 'database') {
      fetchDatabaseTables()
    }
    if (activeTab === 'music') {
      fetchUploadedSongs()
    }
    if (activeTab === 'ontology') {
      fetchSiteOntology()
    }
    if (activeTab === 'personal-content') {
      fetchPersonalContent()
    }
    if (activeTab === 'topics') {
      fetchTopics()
    }
  }, [activeTab, artistFilter, artistStatusFilter, songFilter, songStatusFilter])

  const fetchPersonalContent = async () => {
    try {
      const response = await fetch('/api/personal-content')
      const data = await response.json()
      if (data.success) {
        setPersonalContent(data.content || [])
      }
    } catch (error) {
      console.error('Error fetching personal content:', error)
    }
  }

  const handlePersonalContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/personal-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalContentForm)
      })
      const data = await response.json()
      if (data.success) {
        await fetchPersonalContent()
        setPersonalContentForm({ id: '', category: '', title: '', content: '', is_published: false })
        alert('Personal content saved successfully!')
      }
    } catch (error) {
      console.error('Error saving personal content:', error)
      alert('Error saving personal content')
    }
  }

  const handleDeletePersonalContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    try {
      const response = await fetch(`/api/personal-content?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        await fetchPersonalContent()
        alert('Content deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting personal content:', error)
      alert('Error deleting content')
    }
  }

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics')
      const data = await response.json()
      if (data.success) {
        setTopics(data.topics || [])
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const handleTopicSelect = (topic: any) => {
    setSelectedTopic(topic)
    setTopicForm({
      id: topic.id,
      topic_id: topic.topic_id,
      title: topic.title,
      description: topic.description || '',
      route: topic.route,
      content: topic.content,
      ontology: topic.ontology || {},
      metadata: topic.metadata || {},
      is_active: topic.is_active !== undefined ? topic.is_active : true
    })
  }

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      })

      const data = await response.json()
      if (data.success) {
        await fetchTopics()
        setSelectedTopic(null)
        setTopicForm({
          id: '',
          topic_id: '',
          title: '',
          description: '',
          route: '',
          content: '',
          ontology: {},
          metadata: {},
          is_active: true
        })
        alert('Topic saved successfully!')
      } else {
        alert('Error saving topic: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving topic:', error)
      alert('Error saving topic')
    }
  }

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return

    try {
      const response = await fetch(`/api/topics?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        await fetchTopics()
        setSelectedTopic(null)
        alert('Topic deleted successfully!')
      } else {
        alert('Error deleting topic: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      alert('Error deleting topic')
    }
  }

  const handleUpdateAI = async () => {
    setIsUpdatingAI(true)
    setAiUpdateStatus('Starting ingestion...')
    
    try {
      const response = await fetch('/api/pinecone/ingest-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (data.success) {
        setAiUpdateStatus(`Success! Processed ${data.filesProcessed} files, created ${data.chunksCreated} chunks.`)
      } else {
        setAiUpdateStatus(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error updating AI:', error)
      setAiUpdateStatus(`Error: ${error.message || 'Failed to update AI'}`)
    } finally {
      setIsUpdatingAI(false)
      // Clear status after 5 seconds
      setTimeout(() => setAiUpdateStatus(null), 5000)
    }
  }

  const fetchSiteOntology = async () => {
    try {
      const response = await fetch('/api/site-ontology')
      const data = await response.json()
      if (data.success) {
        setSiteOntology(data.ontology)
      }
    } catch (error) {
      console.error('Error fetching site ontology:', error)
    }
  }

  const fetchUploadedSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist_name, genre, created_at, status, is_public')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching songs:', error)
      } else {
        setUploadedSongs(data || [])
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'file') {
        setUploadForm({ ...uploadForm, file })
      } else {
        setUploadForm({ ...uploadForm, image: file })
      }
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title) {
      alert('Please provide a title and audio file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('artist_name', uploadForm.artist_name)
      formData.append('genre', uploadForm.genre)
      formData.append('file', uploadForm.file)
      if (uploadForm.image) {
        formData.append('image', uploadForm.image)
      }

      const response = await fetch('/api/admin/upload-song', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        alert('Song uploaded successfully!')
        setUploadForm({
          title: '',
          artist_name: 'Joey Hendrickson',
          genre: 'Alternative • Acoustic',
          file: null,
          image: null
        })
        // Reset file inputs
        const fileInput = document.getElementById('audio-file') as HTMLInputElement
        const imageInput = document.getElementById('image-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        if (imageInput) imageInput.value = ''
        await fetchUploadedSongs()
      } else {
        alert('Failed to upload song: ' + result.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading song: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingApprovals();
    }
  }, [activeTab]);


  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your personal site and platform</p>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
                router.push('/')
              } catch (error) {
                console.error('Logout error:', error)
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'topics', label: 'Topics' },
              { id: 'ontology', label: 'Site Ontology' },
              { id: 'personal-content', label: 'Personal Content' },
              { id: 'music', label: 'Music' },
              { id: 'approvals', label: 'Approvals' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'comments', label: 'Voice Comments' },
              { id: 'purchases', label: 'Purchases' },
              { id: 'database', label: 'Database' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#E55A2B] text-[#E55A2B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Update AI Button */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">AI & RAG Management</h2>
              <p className="text-gray-600 mb-4">
                Update the AI knowledge base by ingesting new Google Drive files into Pinecone. This will process all files, extract text content, generate embeddings, and update the vector database.
              </p>
              <button
                onClick={handleUpdateAI}
                disabled={isUpdatingAI}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdatingAI ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update AI
                  </>
                )}
              </button>
              {aiUpdateStatus && (
                <div className={`mt-4 p-4 rounded-lg ${
                  aiUpdateStatus.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {aiUpdateStatus}
                </div>
              )}
            </div>

            {/* Analytics Cards */}
            {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Artists</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalArtists}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Songs</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalSongs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Voice Comments</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalVoiceComments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">${analytics.totalRevenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending Artists</p>
                      <p className="text-sm text-gray-500">{pendingArtists.length} awaiting approval</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="text-[#E55A2B] hover:text-[#D14A1B] text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending Songs</p>
                      <p className="text-sm text-gray-500">{pendingSongs.length} awaiting approval</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="text-[#E55A2B] hover:text-[#D14A1B] text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Analytics</h2>
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Songs</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalSongs}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Active Songs</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.activeSongs}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Voice Comments</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalVoiceComments}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          console.log('RENDER: pendingArtists', pendingArtists),
          <div className="space-y-6">
            {/* Pending Artists */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Pending Artist Approvals</h3>
                <button onClick={fetchPendingApprovals} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Refresh</button>
              </div>
              <div className="p-6">
                {pendingArtists.length === 0 ? (
                  <p className="text-gray-500">No pending artist approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingArtists.map((artist) => (
                      <div key={artist.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{artist.name}</h4>
                          <p className="text-sm text-gray-500">{artist.email}</p>
                          {artist.bio && <p className="text-sm text-gray-600 mt-1">{artist.bio}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveArtist(artist.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectArtist(artist.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Songs */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Song Approvals</h3>
              </div>
              <div className="p-6">
                {pendingSongs.length === 0 ? (
                  <p className="text-gray-500">No pending song approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSongs.map((song) => (
                      <div key={song.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{song.title}</h4>
                          <p className="text-sm text-gray-500">by {song.artist_name}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveSong(song.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectSong(song.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Approval History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Approval History</h3>
                <p className="text-sm text-gray-500 mt-1">Recent approval and rejection actions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote Goal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvalHistory.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                          No approval history found
                        </td>
                      </tr>
                    ) : (
                      approvalHistory.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.item_type === 'song' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.item_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.item_title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.item_artist_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.vote_goal ? `${item.vote_goal} votes` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.vote_price ? `$${item.vote_price.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.action === 'approved' ? 'bg-green-100 text-green-800' :
                              item.action === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.admin_email || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {item.notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Voice Comments Tab */}
        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Voice Comments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voiceComments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comment.song_title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.artist_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comment.status === 'purchased' ? 'bg-green-100 text-green-800' :
                          comment.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comment.audio_data ? (
                          <button
                            onClick={() => playVoiceComment(comment)}
                            className={`p-2 rounded-full transition-colors ${
                              playingAudioId === comment.id
                                ? 'bg-[#E55A2B] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={playingAudioId === comment.id ? 'Pause' : 'Play'}
                          >
                            {playingAudioId === comment.id ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400">No audio</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Purchases</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.session_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.session_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${purchase.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.comment_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signup Analytics Tab */}

        {/* Music Management Tab */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Upload New Song</h2>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B]"
                    placeholder="Enter song title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={uploadForm.artist_name}
                    onChange={(e) => setUploadForm({ ...uploadForm, artist_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B]"
                    placeholder="Joey Hendrickson"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={uploadForm.genre}
                    onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B]"
                    placeholder="Alternative • Acoustic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audio File * (MP3, WAV, etc.)
                  </label>
                  <input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, 'file')}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B]"
                  />
                  {uploadForm.file && (
                    <p className="mt-1 text-sm text-gray-500">
                      Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image (Optional)
                  </label>
                  <input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B]"
                  />
                  {uploadForm.image && (
                    <p className="mt-1 text-sm text-gray-500">
                      Selected: {uploadForm.image.name}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-[#E55A2B] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#D14A1B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Song'}
                </button>
              </form>
            </div>

            {/* Uploaded Songs List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Uploaded Songs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Genre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadedSongs.map((song) => (
                      <tr key={song.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {song.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.artist_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.genre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            song.status === 'approved' && song.is_public
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {song.status === 'approved' && song.is_public ? 'Public' : song.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(song.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploadedSongs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No songs uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Site Ontology Tab */}
        {activeTab === 'ontology' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Site Ontology & Structure</h2>
              {siteOntology ? (
                <div className="space-y-8">
                  {/* Pages Section */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Pages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {siteOntology.pages.map((page: any) => (
                        <div key={page.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-lg text-gray-900">{page.title}</h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{page.route}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{page.description}</p>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700">Content:</p>
                            <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                              {page.content.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                            {page.keyProjects && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Key Projects:</p>
                                <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                                  {page.keyProjects.map((project: string, idx: number) => (
                                    <li key={idx}>{project}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personal Content Categories */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Content Categories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {siteOntology.personalContent.categories.map((category: any) => (
                        <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-gray-900 mb-1">{category.title}</h4>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Loading site ontology...</p>
              )}
            </div>
          </div>
        )}

        {/* Personal Content Tab */}
        {activeTab === 'personal-content' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Manage Personal Content</h2>
              
              {/* Form */}
              <form onSubmit={handlePersonalContentSubmit} className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={personalContentForm.category}
                    onChange={(e) => setPersonalContentForm({ ...personalContentForm, category: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="childhood">Childhood</option>
                    <option value="high-school">High School</option>
                    <option value="college">College</option>
                    <option value="invention-process">Invention Process</option>
                    <option value="travels">Travels</option>
                    <option value="dating">Dating & Relationships</option>
                    <option value="faith">Faith</option>
                    <option value="marriage">Marriage</option>
                    <option value="values">Values</option>
                    <option value="hobbies">Hobbies</option>
                    <option value="gym-routine">Gym Routine</option>
                    <option value="personal-stories">Personal Stories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={personalContentForm.title}
                    onChange={(e) => setPersonalContentForm({ ...personalContentForm, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Content</label>
                  <textarea
                    value={personalContentForm.content}
                    onChange={(e) => setPersonalContentForm({ ...personalContentForm, content: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={personalContentForm.is_published}
                    onChange={(e) => setPersonalContentForm({ ...personalContentForm, is_published: e.target.checked })}
                  />
                  <label htmlFor="is_published" className="text-sm">Publish (make visible to users)</label>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {personalContentForm.id ? 'Update' : 'Create'} Content
                </button>
                {personalContentForm.id && (
                  <button
                    type="button"
                    onClick={() => setPersonalContentForm({ id: '', category: '', title: '', content: '', is_published: false })}
                    className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {/* Content List */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Existing Content</h3>
                <div className="space-y-4">
                  {personalContent.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {item.category.replace('-', ' ')}
                            </span>
                            {item.is_published ? (
                              <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">
                                Published
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                Draft
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap line-clamp-3">
                            {item.content}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setPersonalContentForm({
                              id: item.id,
                              category: item.category,
                              title: item.title,
                              content: item.content,
                              is_published: item.is_published
                            })}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePersonalContent(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {personalContent.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No personal content yet. Create your first piece above!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Manage Topics</h2>
              <p className="text-gray-600 mb-6">
                Topics represent the main pages of your website. Edit content and ontology here to update what appears in AI responses.
              </p>

              {/* Topics List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTopic?.id === topic.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{topic.title}</h3>
                      {topic.is_active ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{topic.description || 'No description'}</p>
                    <p className="text-xs text-gray-500">Route: {topic.route}</p>
                    {topic.ontology && typeof topic.ontology === 'object' && Object.keys(topic.ontology).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Ontology:</p>
                        <div className="text-xs text-gray-600">
                          {topic.ontology.sections && Array.isArray(topic.ontology.sections) && (
                            <p>Sections: {topic.ontology.sections.length}</p>
                          )}
                          {topic.ontology.keyPoints && Array.isArray(topic.ontology.keyPoints) && (
                            <p>Key Points: {topic.ontology.keyPoints.length}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {topics.length === 0 && (
                  <p className="text-gray-500 col-span-full text-center py-8">No topics found. Topics will be created from site pages.</p>
                )}
              </div>

              {/* Topic Editor */}
              {selectedTopic && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-xl font-bold mb-4">Edit Topic: {selectedTopic.title}</h3>
                  <form onSubmit={handleTopicSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Topic ID</label>
                        <input
                          type="text"
                          value={topicForm.topic_id}
                          onChange={(e) => setTopicForm({ ...topicForm, topic_id: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          required
                          disabled={!!topicForm.id}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Route</label>
                        <input
                          type="text"
                          value={topicForm.route}
                          onChange={(e) => setTopicForm({ ...topicForm, route: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title</label>
                      <input
                        type="text"
                        value={topicForm.title}
                        onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={topicForm.description}
                        onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Content (Main Body Text)</label>
                      <textarea
                        value={topicForm.content}
                        onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={8}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">This content will be included in AI responses when users ask about this topic.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ontology (JSON)</label>
                      <textarea
                        value={JSON.stringify(topicForm.ontology, null, 2)}
                        onChange={(e) => {
                          try {
                            setTopicForm({ ...topicForm, ontology: JSON.parse(e.target.value) })
                          } catch (err) {
                            // Invalid JSON, don't update
                          }
                        }}
                        className="w-full border rounded px-3 py-2 font-mono text-sm"
                        rows={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">Structured data about this topic (sections, key points, categories, etc.)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Metadata (JSON)</label>
                      <textarea
                        value={JSON.stringify(topicForm.metadata, null, 2)}
                        onChange={(e) => {
                          try {
                            setTopicForm({ ...topicForm, metadata: JSON.parse(e.target.value) })
                          } catch (err) {
                            // Invalid JSON, don't update
                          }
                        }}
                        className="w-full border rounded px-3 py-2 font-mono text-sm"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">Additional metadata (key projects, achievements, links, etc.)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={topicForm.is_active}
                        onChange={(e) => setTopicForm({ ...topicForm, is_active: e.target.checked })}
                      />
                      <label htmlFor="is_active" className="text-sm">Active (include in AI responses)</label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        Save Topic
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTopic(null)
                          setTopicForm({
                            id: '',
                            topic_id: '',
                            title: '',
                            description: '',
                            route: '',
                            content: '',
                            ontology: {},
                            metadata: {},
                            is_active: true
                          })
                        }}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(topicForm.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-4">Artists Table</h2>
              <div className="flex gap-4 mb-2">
                <input type="text" placeholder="Filter by email" value={artistFilter} onChange={e => setArtistFilter(e.target.value)} className="border px-2 py-1 rounded" />
                <input type="text" placeholder="Filter by status" value={artistStatusFilter} onChange={e => setArtistStatusFilter(e.target.value)} className="border px-2 py-1 rounded" />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {dbArtists[0] && Object.keys(dbArtists[0]).map(col => (
                        <th key={col} className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbArtists.map((artist, idx) => (
                      <tr key={artist.id || idx}>
                        {Object.values(artist).map((val, i) => (
                          <td key={i} className="px-4 py-2 text-sm text-gray-700">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                    {dbArtists.length === 0 && (
                      <tr><td colSpan={20} className="text-center py-4 text-gray-400">No artists found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Songs Table</h2>
              <div className="mb-2 text-sm text-gray-600">
                <b>Status Legend:</b> <span className="font-semibold">Private</span> = uploaded, not submitted; <span className="font-semibold">Pending</span> = awaiting admin approval; <span className="font-semibold">Approved</span> = public on artist page; <span className="font-semibold">Rejected</span> = admin rejected.
              </div>
              <div className="flex gap-4 mb-2">
                <input type="text" placeholder="Filter by title" value={songFilter} onChange={e => setSongFilter(e.target.value)} className="border px-2 py-1 rounded" />
                <input type="text" placeholder="Filter by status" value={songStatusFilter} onChange={e => setSongStatusFilter(e.target.value)} className="border px-2 py-1 rounded" />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {dbSongs[0] && Object.keys(dbSongs[0]).map(col => (
                        <th key={col} className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbSongs.map((song, idx) => (
                      <tr key={song.id || idx}>
                        {Object.values(song).map((val, i) => (
                          <td key={i} className="px-4 py-2 text-sm text-gray-700">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                    {dbSongs.length === 0 && (
                      <tr><td colSpan={20} className="text-center py-4 text-gray-400">No songs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edit Artist Modal */}
        {editingArtist && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Artist</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B] focus:border-[#E55A2B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B] focus:border-[#E55A2B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E55A2B] focus:border-[#E55A2B]"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeEditArtist}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveArtistEdit}
                    className="px-4 py-2 bg-[#E55A2B] text-white rounded-md hover:bg-[#D14A1B]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 