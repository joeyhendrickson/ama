import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const songFile = formData.get('songFile') as File
    const artistId = formData.get('artistId') as string
    const songTitle = formData.get('songTitle') as string
    const genre = formData.get('genre') as string

    if (!songFile || !artistId || !songTitle) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check file type
    if (!songFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an audio file' },
        { status: 400 }
      )
    }

    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (songFile.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 20MB' },
        { status: 400 }
      )
    }

    // Check if artist has reached the 20 song limit
    const { data: existingSongs, error: countError } = await supabase
      .from('songs')
      .select('id')
      .eq('artist_id', artistId)

    if (countError) {
      return NextResponse.json(
        { success: false, message: 'Error checking song count' },
        { status: 500 }
      )
    }

    if (existingSongs && existingSongs.length >= 20) {
      return NextResponse.json(
        { success: false, message: 'Maximum of 20 songs allowed per artist' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = songFile.name.split('.').pop()
    const fileName = `${artistId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('song-files')
      .upload(fileName, songFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Error uploading file' },
        { status: 500 }
      )
    }

    // Get public URL using the actual uploaded file path
    const { data: urlData } = supabase.storage
      .from('song-files')
      .getPublicUrl(fileName)

    console.log('File uploaded successfully:', {
      fileName: fileName,
      publicUrl: urlData.publicUrl,
      originalName: songFile.name
    })

    // Create song record in database - using the correct field names
    const songDataToInsert = {
      title: songTitle,
      artist_id: artistId,
      genre: genre || 'Unknown',
      vote_goal: 100, // Default goal of 100 votes
      current_votes: 0, // Start with 0 votes
      original_vote_count: 0, // Start with 0 original votes
      created_at: new Date().toISOString() // Set current timestamp
    }

    console.log('Attempting to insert song data:', songDataToInsert)

    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert(songDataToInsert)
      .select()
      .single()

    if (songError) {
      console.error('Database error details:', {
        message: songError.message,
        code: songError.code,
        details: songError.details,
        hint: songError.hint
      })
      return NextResponse.json(
        { success: false, message: `Error saving song to database: ${songError.message}` },
        { status: 500 }
      )
    }

    console.log('Song saved to database successfully:', songData)

    return NextResponse.json({
      success: true,
      message: 'Song uploaded successfully',
      song: songData,
      fileUrl: urlData.publicUrl
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 