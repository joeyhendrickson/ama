import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    // Fetch all public, approved songs
    const { data: songs, error } = await supabase
      .from('songs')
      .select('id, title, artist_name, genre, audio_url, image_url, created_at')
      .eq('is_public', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching songs:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      songs: songs || []
    })

  } catch (error) {
    console.error('Error in songs API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

