'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userType, setUserType] = useState<'artist' | 'admin' | null>(null)

  // Check for email verification success
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setSuccess('Email verified successfully! You can now log in with your email and password.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Check if user is an admin first
        const isAdmin = email.includes('admin') || email.includes('launchthatsong.com')
        
        if (isAdmin) {
          // Check if admin exists in admin table or use email pattern
          setUserType('admin')
          router.push('/admin-dashboard')
          return
        }

        // Check if user is an artist
        const { data: artist, error: artistError } = await supabase
          .from('artists')
          .select('id, status')
          .eq('email', email)
          .single()

        if (artistError || !artist) {
          setError('No artist account found with this email')
        } else {
          setUserType('artist')
          
          // Check if artist account is approved
          if (artist.status === 'pending') {
            setError('Your account is pending admin approval. You will be notified once approved.')
          } else {
            router.push('/artist-dashboard')
          }
        }
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Please check your email for a confirmation link')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 p-8 rounded-2xl max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Launch That Song</h1>
          <p className="text-gray-600">Artist & Admin Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Artist Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <div className="text-gray-600 text-sm mb-4">
            <p><strong>Artists:</strong> Use your registered email</p>
            <p><strong>Admins:</strong> Use admin@launchthatsong.com</p>
          </div>
          <div className="space-y-2">
            <Link
              href="/artist-signup"
              className="block text-blue-600 hover:text-blue-700 transition-colors text-sm"
            >
              → Create New Artist Account
            </Link>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              ← Back to Launch That Song
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 