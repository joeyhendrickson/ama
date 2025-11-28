import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET - Fetch all speaker videos
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('speaker_videos')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      videos: data || []
    })
  } catch (error) {
    console.error('Error in GET speaker videos:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new speaker video
export async function POST(request: NextRequest) {
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
    const isAdminEmail = user.email === 'admin@launchthatsong.com'
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

    const body = await request.json()
    const { title, event, year, role, description, eventPageUrl, youtubeId, location, topics } = body

    if (!title || !event) {
      return NextResponse.json(
        { success: false, message: 'Title and event are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('speaker_videos')
      .insert({
        title,
        event,
        year: year || null,
        role: role || 'speaker',
        description: description || null,
        event_page_url: eventPageUrl || null,
        youtube_id: youtubeId || null,
        location: location || null,
        topics: topics || []
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating video:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      video: data
    })
  } catch (error) {
    console.error('Error in POST speaker videos:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete speaker video
export async function DELETE(request: NextRequest) {
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
    const isAdminEmail = user.email === 'admin@launchthatsong.com'
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('speaker_videos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting video:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE speaker videos:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

