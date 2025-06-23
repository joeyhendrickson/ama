import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')
    const timeRange = searchParams.get('timeRange') || '30d' // 7d, 30d, 90d, 1y

    if (!artistId) {
      return NextResponse.json(
        { success: false, message: 'Artist ID is required' },
        { status: 400 }
      )
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get page views
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('artist_analytics')
      .select('id')
      .eq('artist_id', artistId)
      .eq('event_type', 'pageview')
      .gte('timestamp', startDate.toISOString())

    // Get votes
    const { data: votes, error: votesError } = await supabase
      .from('artist_analytics')
      .select('id')
      .eq('artist_id', artistId)
      .eq('event_type', 'vote')
      .gte('timestamp', startDate.toISOString())

    // Get clicks (excluding votes)
    const { data: clicks, error: clicksError } = await supabase
      .from('artist_analytics')
      .select('id')
      .eq('artist_id', artistId)
      .eq('event_type', 'click')
      .gte('timestamp', startDate.toISOString())

    // Get average session time
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('total_time_seconds')
      .eq('artist_id', artistId)
      .gte('start_time', startDate.toISOString())
      .not('total_time_seconds', 'is', null)

    // Get audio listening time
    const { data: audioSessions, error: audioError } = await supabase
      .from('audio_sessions')
      .select('duration_seconds')
      .eq('artist_id', artistId)
      .gte('start_time', startDate.toISOString())
      .not('duration_seconds', 'is', null)

    // Get revenue data
    const { data: revenue, error: revenueError } = await supabase
      .from('artist_revenue')
      .select('*')
      .eq('artist_id', artistId)
      .single()

    // Calculate totals
    const totalPageViews = pageViews?.length || 0
    const totalVotes = votes?.length || 0
    const totalClicks = clicks?.length || 0
    
    const avgSessionTime = sessions && sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + (session.total_time_seconds || 0), 0) / sessions.length
      : 0
    
    const totalAudioTime = audioSessions && audioSessions.length > 0
      ? audioSessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0)
      : 0

    // Get unique visitors (by IP)
    const { data: uniqueVisitors, error: visitorsError } = await supabase
      .from('artist_analytics')
      .select('ip_address')
      .eq('artist_id', artistId)
      .eq('event_type', 'pageview')
      .gte('timestamp', startDate.toISOString())

    const uniqueVisitorCount = uniqueVisitors 
      ? new Set(uniqueVisitors.map(v => v.ip_address)).size
      : 0

    // Get conversion rate (votes per page view)
    const conversionRate = totalPageViews > 0 
      ? (totalVotes / totalPageViews * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      success: true,
      data: {
        artistId,
        timeRange,
        pageViews: totalPageViews,
        uniqueVisitors: uniqueVisitorCount,
        votes: totalVotes,
        clicks: totalClicks,
        avgSessionTimeSeconds: Math.round(avgSessionTime),
        avgSessionTimeFormatted: formatTime(avgSessionTime),
        totalAudioTimeSeconds: totalAudioTime,
        totalAudioTimeFormatted: formatTime(totalAudioTime),
        conversionRate: `${conversionRate}%`,
        revenue: {
          total: revenue?.total_revenue || 0,
          payouts: revenue?.total_payouts || 0,
          pending: revenue?.pending_payouts || 0
        },
        engagement: {
          avgTimeOnPage: formatTime(avgSessionTime),
          audioEngagement: totalAudioTime > 0 ? formatTime(totalAudioTime) : 'No audio data',
          clickThroughRate: totalPageViews > 0 ? (totalClicks / totalPageViews * 100).toFixed(2) + '%' : '0%'
        }
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatTime(seconds: number): string {
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