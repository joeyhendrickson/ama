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

    // Enhanced file validation
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

    // Check for minimum file size (prevent empty or corrupted files)
    if (songFile.size < 1024) { // Less than 1KB
      return NextResponse.json(
        { success: false, message: 'File appears to be empty or corrupted' },
        { status: 400 }
      )
    }

    // Validate file extension
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'aiff', 'aif', 'flac', 'ogg']
    const fileExtension = songFile.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, message: 'File must be MP3, WAV, M4A, AIFF, AIF, FLAC, or OGG format' },
        { status: 400 }
      )
    }

    // Calculate file hash for integrity checking
    const fileBuffer = await songFile.arrayBuffer()
    const fileHash = await calculateFileHash(fileBuffer)
    
    console.log('File validation passed:', {
      name: songFile.name,
      size: songFile.size,
      type: songFile.type,
      extension: fileExtension,
      hash: fileHash
    })

    // Generate unique filename with hash for integrity
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${artistId}/${timestamp}-${randomString}-${fileHash.substring(0, 8)}.${fileExtension}`

    // Upload file to Supabase Storage with enhanced options
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('song-files')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: songFile.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Error uploading file: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Verify upload by downloading and checking hash
    const { data: verifyData, error: verifyError } = await supabase.storage
      .from('song-files')
      .download(fileName)

    if (verifyError) {
      console.error('Verification download error:', verifyError)
      // Try to clean up the failed upload
      await supabase.storage.from('song-files').remove([fileName])
      return NextResponse.json(
        { success: false, message: 'File upload verification failed' },
        { status: 500 }
      )
    }

    // Verify file integrity
    const verifyBuffer = await verifyData.arrayBuffer()
    const verifyHash = await calculateFileHash(verifyBuffer)
    
    if (fileHash !== verifyHash) {
      console.error('File integrity check failed:', { original: fileHash, uploaded: verifyHash })
      // Clean up the corrupted upload
      await supabase.storage.from('song-files').remove([fileName])
      return NextResponse.json(
        { success: false, message: 'File corruption detected during upload. Please try again.' },
        { status: 500 }
      )
    }

    // Get public URL using the actual uploaded file path
    const { data: urlData } = supabase.storage
      .from('song-files')
      .getPublicUrl(fileName)

    console.log('File uploaded and verified successfully:', {
      fileName: fileName,
      publicUrl: urlData.publicUrl,
      originalName: songFile.name,
      fileSize: songFile.size,
      fileHash: fileHash
    })

    // Create song record in database with enhanced metadata
    const songDataToInsert = {
      title: songTitle,
      artist_id: artistId,
      genre: genre || 'Unknown',
      vote_goal: voteGoal,
      vote_price: votePrice,
      current_votes: 0,
      original_vote_count: 0,
      file_url: urlData.publicUrl,
      audio_url: urlData.publicUrl, // Also set audio_url for compatibility
      file_size: songFile.size,
      file_hash: fileHash, // Store hash for future integrity checks
      created_at: new Date().toISOString(),
      status: 'pending'
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
      // Clean up the uploaded file if database insert fails
      await supabase.storage.from('song-files').remove([fileName])
      return NextResponse.json(
        { success: false, message: `Error saving song to database: ${songError.message}` },
        { status: 500 }
      )
    }

    console.log('Song saved to database successfully:', songData)

    return NextResponse.json({
      success: true,
      message: 'Song uploaded successfully with integrity verification',
      song: songData,
      fileHash: fileHash
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

// Helper function to calculate file hash
async function calculateFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
} 