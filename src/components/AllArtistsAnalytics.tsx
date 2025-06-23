'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface ArtistAnalyticsSummary {
  artistId: string
  artistName: string
  artistEmail: string
  pageViews: number
  uniqueVisitors: number
  votes: number
  clicks: number
  avgSessionTime: number
  totalAudioTime: number
  conversionRate: number
  revenue: {
    total: number
    payouts: number
    pending: number
  }
}

export default function AllArtistsAnalytics() {
  const [analytics, setAnalytics] = useState<ArtistAnalyticsSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [sortBy, setSortBy] = useState<'pageViews' | 'votes' | 'revenue' | 'conversionRate'>('pageViews')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchAllArtistsAnalytics()
  }, [timeRange])

  const fetchAllArtistsAnalytics = async () => {
    setLoading(true)
    try {
      // Get all artists
      const { data: artists, error: artistsError } = await supabase
        .from('artists')
        .select('id, name, email')
        .eq('status', 'approved')

      if (artistsError || !artists) {
        console.error('Error fetching artists:', artistsError)
        return
      }

      // Fetch analytics for each artist
      const analyticsPromises = artists.map(async (artist) => {
        try {
          const response = await fetch(`/api/analytics/artist-stats?artistId=${artist.id}&timeRange=${timeRange}`)
          const result = await response.json()
          
          if (result.success) {
            return {
              artistId: artist.id,
              artistName: artist.name,
              artistEmail: artist.email,
              pageViews: result.data.pageViews,
              uniqueVisitors: result.data.uniqueVisitors,
              votes: result.data.votes,
              clicks: result.data.clicks,
              avgSessionTime: result.data.avgSessionTimeSeconds,
              totalAudioTime: result.data.totalAudioTimeSeconds,
              conversionRate: parseFloat(result.data.conversionRate.replace('%', '')),
              revenue: result.data.revenue
            }
          }
        } catch (error) {
          console.error(`Error fetching analytics for ${artist.name}:`, error)
        }
        
        // Return default data if analytics fetch failed
        return {
          artistId: artist.id,
          artistName: artist.name,
          artistEmail: artist.email,
          pageViews: 0,
          uniqueVisitors: 0,
          votes: 0,
          clicks: 0,
          avgSessionTime: 0,
          totalAudioTime: 0,
          conversionRate: 0,
          revenue: { total: 0, payouts: 0, pending: 0 }
        }
      })

      const analyticsData = await Promise.all(analyticsPromises)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching all artists analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  const sortedAnalytics = [...analytics].sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortBy) {
      case 'pageViews':
        aValue = a.pageViews
        bValue = b.pageViews
        break
      case 'votes':
        aValue = a.votes
        bValue = b.votes
        break
      case 'revenue':
        aValue = a.revenue.total
        bValue = b.revenue.total
        break
      case 'conversionRate':
        aValue = a.conversionRate
        bValue = b.conversionRate
        break
      default:
        aValue = a.pageViews
        bValue = b.pageViews
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
  })

  const totalStats = analytics.reduce((acc, artist) => ({
    pageViews: acc.pageViews + artist.pageViews,
    uniqueVisitors: acc.uniqueVisitors + artist.uniqueVisitors,
    votes: acc.votes + artist.votes,
    clicks: acc.clicks + artist.clicks,
    revenue: acc.revenue + artist.revenue.total,
    payouts: acc.payouts + artist.revenue.payouts
  }), {
    pageViews: 0,
    uniqueVisitors: 0,
    votes: 0,
    clicks: 0,
    revenue: 0,
    payouts: 0
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">All Artists Analytics</h3>
          <p className="text-sm text-gray-600">Performance metrics across all artists</p>
        </div>
        
        <div className="flex gap-2">
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
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pageViews">Page Views</option>
            <option value="votes">Votes</option>
            <option value="revenue">Revenue</option>
            <option value="conversionRate">Conversion Rate</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600">Total Page Views</div>
          <div className="text-2xl font-bold text-blue-800">{totalStats.pageViews.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600">Total Votes</div>
          <div className="text-2xl font-bold text-green-800">{totalStats.votes.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-600">Total Revenue</div>
          <div className="text-2xl font-bold text-purple-800">${totalStats.revenue.toFixed(2)}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-600">Total Payouts</div>
          <div className="text-2xl font-bold text-orange-800">${totalStats.payouts.toFixed(2)}</div>
        </div>
      </div>

      {/* Artists Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Artist</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Page Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unique Visitors</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Votes</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Conversion Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avg Session</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Audio Time</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Revenue</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payouts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAnalytics.map((artist) => (
              <tr key={artist.artistId} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{artist.artistName}</div>
                    <div className="text-sm text-gray-500">{artist.artistEmail}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">{artist.pageViews.toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{artist.uniqueVisitors.toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{artist.votes.toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{artist.conversionRate.toFixed(1)}%</td>
                <td className="px-4 py-4 text-sm text-gray-900">{formatTime(artist.avgSessionTime)}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{formatTime(artist.totalAudioTime)}</td>
                <td className="px-4 py-4 text-sm font-medium text-green-600">${artist.revenue.total.toFixed(2)}</td>
                <td className="px-4 py-4 text-sm font-medium text-blue-600">${artist.revenue.payouts.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAnalytics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No analytics data available for the selected time period
        </div>
      )}
    </div>
  )
} 