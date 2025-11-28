import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { songIds, orderId } = body

    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Song IDs are required' },
        { status: 400 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch songs with audio URLs
    const { data: songs, error } = await supabase
      .from('songs')
      .select('id, title, artist_name, audio_url, file_url')
      .in('id', songIds)
      .eq('is_public', true)
      .eq('status', 'approved')

    if (error) {
      console.error('Error fetching songs:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    if (!songs || songs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No songs found' },
        { status: 404 }
      )
    }

    // Return download URLs
    const downloadLinks = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist_name: song.artist_name,
      downloadUrl: song.file_url || song.audio_url,
    }))

    // TODO: Store purchase record in database if needed
    // You can create a purchases table to track downloads

    return NextResponse.json({
      success: true,
      downloads: downloadLinks,
      orderId,
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

