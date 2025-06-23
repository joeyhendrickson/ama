'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface ArtistAnalyticsProps {
  artistId: string
}

interface AnalyticsData {
  artistId: string
  timeRange: string
  pageViews: number
  uniqueVisitors: number
  votes: number
  clicks: number
  avgSessionTimeSeconds: number
  avgSessionTimeFormatted: string
  totalAudioTimeSeconds: number
  totalAudioTimeFormatted: string
  conversionRate: string
  revenue: {
    total: number
    payouts: number
    pending: number
  }
  engagement: {
    avgTimeOnPage: string
    audioEngagement: string
    clickThroughRate: string
  }
}

export default function ArtistAnalytics({ artistId }: ArtistAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState<any>(null)

  useEffect(() => {
    fetchArtist()
    fetchAnalytics()
  }, [artistId, timeRange])

  const fetchArtist = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single()

    if (data) {
      setArtist(data)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/artist-stats?artistId=${artistId}&timeRange=${timeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Analytics for {artist?.name || 'Artist'}
          </h3>
          <p className="text-sm text-gray-600">Performance metrics and insights</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Traffic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Page Views</p>
              <p className="text-2xl font-bold text-blue-800">{analytics.pageViews.toLocaleString()}</p>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-green-800">{analytics.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="text-green-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Votes</p>
              <p className="text-2xl font-bold text-purple-800">{analytics.votes.toLocaleString()}</p>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-800">{analytics.conversionRate}</p>
            </div>
            <div className="text-orange-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Engagement</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Time on Page:</span>
              <span className="text-sm font-medium">{analytics.engagement.avgTimeOnPage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Audio Engagement:</span>
              <span className="text-sm font-medium">{analytics.engagement.audioEngagement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Click Through Rate:</span>
              <span className="text-sm font-medium">{analytics.engagement.clickThroughRate}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Revenue</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue:</span>
              <span className="text-sm font-medium text-green-600">${analytics.revenue.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Payouts:</span>
              <span className="text-sm font-medium text-blue-600">${analytics.revenue.payouts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Payouts:</span>
              <span className="text-sm font-medium text-orange-600">${analytics.revenue.pending.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Clicks:</span>
              <span className="text-sm font-medium">{analytics.clicks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Audio Time:</span>
              <span className="text-sm font-medium">{analytics.totalAudioTimeFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Session Time:</span>
              <span className="text-sm font-medium">{analytics.avgSessionTimeFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Key Insights</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• {analytics.uniqueVisitors} unique visitors generated {analytics.votes} votes</p>
          <p>• Average visitor spent {analytics.engagement.avgTimeOnPage} on the page</p>
          <p>• {analytics.conversionRate} of page visitors converted to votes</p>
          <p>• Total revenue: ${analytics.revenue.total.toFixed(2)} with ${analytics.revenue.payouts.toFixed(2)} paid out</p>
        </div>
      </div>
    </div>
  )
} 