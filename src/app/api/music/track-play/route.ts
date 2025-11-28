import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// POST - Track song play/stream
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { songId } = body

    if (!songId) {
      return NextResponse.json(
        { success: false, message: 'Song ID is required' },
        { status: 400 }
      )
    }

    // Increment stream count
    const { data: song, error: fetchError } = await supabase
      .from('songs')
      .select('stream_count')
      .eq('id', songId)
      .single()

    if (fetchError) {
      console.error('Error fetching song:', fetchError)
      return NextResponse.json(
        { success: false, message: fetchError.message },
        { status: 500 }
      )
    }

    const currentStreams = song?.stream_count || 0

    const { error: updateError } = await supabase
      .from('songs')
      .update({ stream_count: currentStreams + 1 })
      .eq('id', songId)

    if (updateError) {
      console.error('Error updating stream count:', updateError)
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Stream tracked successfully'
    })
  } catch (error) {
    console.error('Error in POST track play:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

