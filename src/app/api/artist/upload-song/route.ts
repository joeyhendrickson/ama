import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const songTitle = formData.get('songTitle') as string
    const genre = formData.get('genre') as string
    const songFile = formData.get('songFile') as File
    const voteGoal = parseInt(formData.get('voteGoal') as string) || 50
    const votePrice = parseFloat(formData.get('votePrice') as string) || 1.00

    if (!songTitle || !songFile) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate vote goal and price
    if (voteGoal < 1 || voteGoal > 10000) {
      return NextResponse.json(
        { success: false, message: 'Vote goal must be between 1 and 10,000' },
        { status: 400 }
      )
    }

    if (votePrice < 0.10 || votePrice > 100) {
      return NextResponse.json(
        { success: false, message: 'Vote price must be between $0.10 and $100' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get artist ID
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('email', user.email)
      .single()

    if (artistError || !artistData) {
      return NextResponse.json(
        { success: false, message: 'Artist profile not found' },
        { status: 404 }
      )
    }

    const artistId = artistData.id

    // Validate file type
    if (!songFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an audio file' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    if (songFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = songFile.name.split('.').pop()
    const fileName = `${artistId}/${timestamp}-${randomString}.${fileExtension}`

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

    // Create song record in database with custom vote goal and pricing
    const songDataToInsert = {
      title: songTitle,
      artist_id: artistId,
      genre: genre || 'Unknown',
      vote_goal: voteGoal, // Custom vote goal set by artist
      vote_price: votePrice, // Custom price per vote set by artist
      current_votes: 0, // Start with 0 votes
      original_vote_count: 0, // Start with 0 original votes
      file_url: urlData.publicUrl, // Save the public URL
      file_size: songFile.size, // Save the file size
      created_at: new Date().toISOString(), // Set current timestamp
      status: 'pending' // New songs are pending admin approval
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
      song: songData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 