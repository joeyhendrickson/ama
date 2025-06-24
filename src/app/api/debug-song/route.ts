import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistName = searchParams.get('artist')
    let artistId = searchParams.get('artistId')

    // If artistId is not provided, look up by artist name
    if (!artistId && artistName) {
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .ilike('name', `%${artistName}%`)
        .single()
      if (artistError || !artist) {
        return NextResponse.json({ error: 'Artist not found', artistName })
      }
      artistId = artist.id
    }

    if (!artistId) {
      return NextResponse.json({ error: 'artistId or artist name required' })
    }

    // Fetch all songs for the artist
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (songsError) {
      return NextResponse.json({ error: 'Error fetching songs', details: songsError })
    }

    return NextResponse.json({
      artistId,
      songCount: songs.length,
      songs: songs.map(s => ({
        id: s.id,
        title: s.title,
        is_public: s.is_public,
        status: s.status,
        submitted_for_approval: s.submitted_for_approval,
        created_at: s.created_at,
        file_url: s.file_url,
        audio_url: s.audio_url
      }))
    })
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error', details: String(e) })
  }
} 