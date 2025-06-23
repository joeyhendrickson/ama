import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { artistId, eventType, data } = await request.json()

    if (!artistId || !eventType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user IP and user agent for analytics
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown'

    // Create analytics record
    const analyticsData = {
      artist_id: artistId,
      event_type: eventType, // 'pageview', 'vote', 'audio_play', 'audio_pause', 'time_spent'
      event_data: data || {},
      user_agent: userAgent,
      ip_address: ip,
      timestamp: new Date().toISOString()
    }

    const { error } = await supabase
      .from('artist_analytics')
      .insert(analyticsData)

    if (error) {
      console.error('Analytics tracking error:', error)
      return NextResponse.json(
        { success: false, message: 'Error tracking analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics tracked successfully'
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 