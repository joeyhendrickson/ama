import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET - Fetch music analytics (streams/views)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdminEmail = user.email === 'joeyhendrickson@me.com'
    let isAdmin = isAdminEmail

    if (!isAdminEmail) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      isAdmin = !!adminUser
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Fetch songs with analytics
    const { data: songs, error } = await supabase
      .from('songs')
      .select('id, title, artist_name, stream_count, view_count, created_at')
      .eq('is_public', true)
      .eq('status', 'approved')
      .order('stream_count', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalStreams = songs?.reduce((sum, song) => sum + (song.stream_count || 0), 0) || 0
    const totalViews = songs?.reduce((sum, song) => sum + (song.view_count || 0), 0) || 0

    return NextResponse.json({
      success: true,
      songs: songs || [],
      totals: {
        streams: totalStreams,
        views: totalViews
      }
    })
  } catch (error) {
    console.error('Error in GET music analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

