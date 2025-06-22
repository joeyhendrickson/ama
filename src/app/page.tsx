'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'

type Artist = {
  id: string
  name: string
  bio: string
  image_url: string
  spotify_url: string
  soundcloud_url: string
  website_url: string
  genre?: string
  vote_percentage?: number
}

type Song = {
  id: string
  title: string
  artist_name: string
  genre: string
  created_at: string
  vote_count: number
  target_votes: number
  status: string
}

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState(-1)
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    password: '',
    confirmPassword: '',
    songName: '',
    songFile: null as File | null,
    bio: '',
    soundcloudLink: '',
    website: '',
    message: '',
    agreeToTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [animatedCards, setAnimatedCards] = useState<number[]>([])
  const { cartItems } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch artists (only approved ones)
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .eq('status', 'approved')
        .order('name')

      if (artistsError) {
        console.error('Error fetching artists:', artistsError.message)
        setError(artistsError.message)
      } else {
        const artistsWithDummyData = artistsData.map((artist: Artist) => {
          let genre = 'Pop • Rock' // default
          
          // Set specific genres for known artists
          if (artist.name === 'Douggert') {
            genre = 'Punk Electronica • EDM'
          } else if (artist.name === 'Joey Hendrickson') {
            genre = 'Alternative • Acoustic'
          } else if (artist.name === 'Columbus Songwriters Association') {
            genre = 'Pop • Acoustic'
          }
          
          return {
            ...artist,
            genre,
            vote_percentage: Math.floor(Math.random() * (85 - 40 + 1)) + 40,
          }
        })
        setArtists(artistsWithDummyData)
      }

      // Fetch recent songs (only approved ones)
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (songsError) {
        console.error('Error fetching songs:', songsError.message)
      } else {
        setRecentSongs(songsData || [])
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, songFile: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        setIsSubmitting(false)
        return
      }

      // Validate password length
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters')
        setIsSubmitting(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('artistName', formData.artistName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('confirmPassword', formData.confirmPassword)
      formDataToSend.append('songName', formData.songName)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('soundcloudLink', formData.soundcloudLink)
      formDataToSend.append('website', formData.website)
      formDataToSend.append('message', formData.message)
      
      if (formData.songFile) {
        formDataToSend.append('songFile', formData.songFile)
      }

      // Send to artist signup endpoint
      const response = await fetch('/api/artist-signup', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Artist account created successfully! Please check your email to confirm your account. You can then login to access your dashboard.')
        setIsModalOpen(false)
        setFormData({
          artistName: '',
          email: '',
          password: '',
          confirmPassword: '',
          songName: '',
          songFile: null,
          bio: '',
          soundcloudLink: '',
          website: '',
          message: '',
          agreeToTerms: false
        })
      } else {
        alert(result.message || 'There was an error creating your account. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error creating your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVotePercentage = (voteCount: number, targetVotes: number) => {
    return Math.min(Math.round((voteCount / targetVotes) * 100), 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'launched': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🎵'
      case 'pending': return '⏳'
      case 'launched': return '🚀'
      default: return '📝'
    }
  }

  const triggerArtistCardAnimation = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setActiveCardIndex(0)
    
    const animateNextCard = (index: number) => {
      if (index >= artists.length) {
        // Animation complete
        setIsAnimating(false)
        setActiveCardIndex(-1)
        return
      }
      
      setActiveCardIndex(index)
      
      setTimeout(() => {
        animateNextCard(index + 1)
      }, 3000) // 3 seconds per card
    }
    
    animateNextCard(0)
  }

  return (
    <>
      <section className="text-center py-20 sm:py-32 container mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
          Vote to Launch
          <br />
          New Songs on Spotify
        </h1>
        <p className="text-lg md:text-xl text-orange-300/80 mt-6 max-w-2xl mx-auto">
          Support your favorite artists and earn NFTs for launching their songs
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            className="bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
            onClick={triggerArtistCardAnimation}
          >
            Explore Songs
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-transparent border border-orange-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-orange-500/20 transition-colors w-full sm:w-auto"
          >
            Submit Your Song
          </button>
        </div>
      </section>
      
      <main className="container mx-auto px-4 md:px-0 pb-20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center sm:text-left">
          Featured Artists
        </h2>

        {error && (
          <p className="text-red-500 bg-red-900/50 p-4 rounded-lg text-center mb-6">
            Error: {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist, index) => {
            const isColumbusCard = artist.name === 'Columbus Songwriters Association'
            const imageContainerHeight = isColumbusCard ? 'h-48' : 'h-[32rem]'
            const imageFitStyle = isColumbusCard ? 'object-contain' : 'object-cover'

            return (
              <div 
                key={artist.id} 
                className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group ${
                  activeCardIndex === index ? 'animate-card-pulse ring-4 ring-blue-700 ring-opacity-75 shadow-2xl' : ''
                }`}
                style={{ 
                  height: `${Math.min(400 + index * 20, 500)}px`
                }}
              >
                <div className={`relative ${imageContainerHeight}`}>
                  <Image
                    src={artist.image_url}
                    alt={artist.name}
                    fill
                    className={`w-full h-full group-hover:scale-105 transition-transform duration-300 ${imageFitStyle}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    <h3 className="text-3xl font-bold">{artist.name}</h3>
                    <p className="text-sm text-orange-300/90">{artist.genre}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                    <div 
                      className="bg-black h-3 rounded-full transition-all duration-500"
                      style={{ width: `${artist.vote_percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300 mb-4">
                    <span>{artist.vote_percentage}%</span>
                    <span>Vote now</span>
                  </div>

                  <Link href={`/artist/${artist.id}`} className="block w-full">
                    <button 
                      className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Vote Now
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>
      
      {/* How It Works Section */}
      <div className="container mx-auto px-4 mt-80 mb-32" data-section="how-it-works">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                1
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Vote!</h3>
            <p className="text-blue-200 leading-relaxed">
              Support your favorite artist by voting for their unreleased song. Every vote counts toward launching their music to the world!
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                2
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Earn NFT!</h3>
            <p className="text-blue-200 leading-relaxed">
              Get exclusive limited-edition NFTs with real artist perks: backstage passes, house concerts, private showcases, and more!
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                3
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Launch That Song!</h3>
            <p className="text-blue-200 leading-relaxed">
              Watch as your votes help artists reach their launch goals. Track progress in real-time and see the impact of your support!
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button 
            className="bg-orange-700 hover:bg-orange-800 text-white font-semibold py-4 px-10 rounded-lg transition-colors text-lg"
            onClick={triggerArtistCardAnimation}
          >
            Limited Time: Vote Now and Collect NFTs!
          </button>
        </div>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 z-50">
          {/* Back Arrow - Fixed Position */}
          <Link 
            href="/" 
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 inline-flex items-center justify-center w-12 h-12 bg-white backdrop-blur-md border border-white/30 rounded-full text-blue-800 hover:text-blue-900 hover:bg-gray-100 transition-all duration-300 group shadow-lg"
            onClick={() => setIsModalOpen(false)}
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

          {/* Navbar */}
          <div className="fixed top-0 left-0 right-0 z-40">
            <div className="sticky top-0 z-50 py-4">
              <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsModalOpen(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-8 h-8 text-orange-500"
                  >
                    <path
                      d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                    />
                  </svg>
                  <span className="text-xl font-bold text-white">LaunchThatSong</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/#connect" className="hover:text-orange-400 transition-colors" onClick={() => setIsModalOpen(false)}>
                    Connect
                  </Link>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false)
                      setTimeout(() => {
                        const element = document.querySelector('[data-section="how-it-works"]')
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      }, 100)
                    }}
                    className="hover:text-orange-400 transition-colors bg-transparent border-none text-white cursor-pointer"
                  >
                    How It Works
                  </button>
                  <Link
                    href="/login"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-2 px-4 rounded-full hover:bg-white/20 transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Login
                  </Link>
                  <Link href="/cart" className="relative hover:text-orange-400 transition-colors" onClick={() => setIsModalOpen(false)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.46-5.23c.18-.487.22-1.01.12-1.521a.75.75 0 00-.728-.654h-12.21l-1.581-5.927A.75.75 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.reduce((acc, item) => acc + item.voteCount, 0)}
                      </span>
                    )}
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* iPhone Frame */}
          <div className="relative mt-20">
            {/* iPhone Body */}
            <div className="w-[500px] h-[1000px] bg-black rounded-[3rem] p-4 shadow-2xl">
              {/* iPhone Screen */}
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* iPhone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-10"></div>
                
                {/* iPhone Status Bar */}
                <div className="absolute top-3 left-0 right-0 flex justify-between items-center px-10 text-black text-base font-semibold z-20">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-7 h-4 border-2 border-black rounded-sm">
                      <div className="w-5 h-1.5 bg-black rounded-sm m-0.5"></div>
                    </div>
                    <span>100%</span>
                  </div>
                </div>

                {/* App Content */}
                <div className="pt-12 h-full overflow-y-auto">
                  {/* App Header */}
                  <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-black">Submit Your Song</h2>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-black hover:bg-gray-300 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Artist Name *
                        </label>
                        <input
                          type="text"
                          name="artistName"
                          value={formData.artistName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="Enter artist name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="Enter your password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="Confirm your password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Song Name *
                        </label>
                        <input
                          type="text"
                          name="songName"
                          value={formData.songName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="Enter song name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Song Upload (.mp3) *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            name="songFile"
                            accept=".mp3"
                            onChange={handleFileChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio *
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base resize-none"
                          placeholder="Tell us about yourself and your music"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SoundCloud Link
                        </label>
                        <input
                          type="url"
                          name="soundcloudLink"
                          value={formData.soundcloudLink}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="https://soundcloud.com/your-profile"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base"
                          placeholder="https://your-website.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 text-base resize-none"
                          placeholder="Any additional message you'd like to share"
                        />
                      </div>

                      <div className="flex items-start space-x-3 py-2">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          required
                          className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded bg-gray-50 mt-0.5"
                        />
                        <label className="block text-sm text-gray-700 leading-relaxed">
                          I agree to the terms and conditions *
                        </label>
                      </div>

                      {/* iPhone-style Button Container */}
                      <div className="pt-6 space-y-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 font-semibold text-base"
                        >
                          {isSubmitting ? 'Creating Account...' : 'Create Artist Account'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="w-full py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors text-base"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}