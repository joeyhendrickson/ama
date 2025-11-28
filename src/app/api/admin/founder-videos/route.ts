import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET - Fetch all founder videos
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('founder_videos')
      .select('*')
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
    console.error('Error in GET founder videos:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new founder video
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

    const body = await request.json()
    const { title, outlet, youtubeId, description, year } = body

    if (!title || !youtubeId) {
      return NextResponse.json(
        { success: false, message: 'Title and YouTube ID are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('founder_videos')
      .insert({
        title,
        outlet: outlet || 'NBC',
        youtube_id: youtubeId,
        description: description || null,
        year: year || null
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
    console.error('Error in POST founder videos:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete founder video
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('founder_videos')
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
    console.error('Error in DELETE founder videos:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

