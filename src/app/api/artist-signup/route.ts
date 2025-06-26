import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const artistName = formData.get('artistName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const songName = formData.get('songName') as string
    const bio = formData.get('bio') as string
    const website = formData.get('website') as string
    const songFile = formData.get('songFile') as File
    const bioImage = formData.get('bioImage') as File

    // Validation
    if (!artistName || !email || !password || !songName || !bio || !songFile || !bioImage) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingArtist, error: checkError } = await supabase
      .from('artists')
      .select('id')
      .eq('email', email)
      .single()

    if (existingArtist) {
      return NextResponse.json(
        { success: false, message: 'An artist with this email already exists' },
        { status: 400 }
      )
    }

    // Create Supabase Auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/login?verified=true`,
        data: {
          artist_name: artistName,
          signup_type: 'artist'
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { success: false, message: 'Failed to create account: ' + authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Upload bio image (now required)
    const sanitizedBioImageName = bioImage.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const bioImageName = `bio-${Date.now()}-${sanitizedBioImageName}`;
    const { data: bioUploadData, error: bioUploadError } = await supabase.storage
      .from('artist-images')
      .upload(bioImageName, bioImage);

    if (bioUploadError) {
      console.error('Bio image upload error:', bioUploadError)
      return NextResponse.json(
        { success: false, message: 'Failed to upload artist photo' },
        { status: 500 }
      )
    }

    // Get the public URL for the bio image
    const { data: bioUrlData } = supabase.storage
      .from('artist-images')
      .getPublicUrl(bioImageName);
    const bioImageUrl = bioUrlData.publicUrl;

    // Enhanced audio file validation
    const allowedTypes = [
      'audio/mpeg', // mp3
      'audio/wav',
      'audio/x-wav',
      'audio/mp4', // m4a
      'audio/x-m4a',
      'audio/aiff',
      'audio/x-aiff',
      'audio/flac',
      'audio/ogg'
    ];
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'aiff', 'aif', 'flac', 'ogg'];
    const fileExtension = songFile.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(songFile.type) && !allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { success: false, message: 'File must be MP3, WAV, M4A, AIFF, AIF, FLAC, or OGG format' },
        { status: 400 }
      )
    }

    // Check for minimum file size (prevent empty or corrupted files)
    if (songFile.size < 1024) { // Less than 1KB
      return NextResponse.json(
        { success: false, message: 'Audio file appears to be empty or corrupted' },
        { status: 400 }
      )
    }

    // Check for maximum file size (50MB)
    if (songFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Audio file size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Calculate file hash for integrity checking
    const fileBuffer = await songFile.arrayBuffer()
    const fileHash = await calculateFileHash(fileBuffer)
    
    console.log('Audio file validation passed:', {
      name: songFile.name,
      size: songFile.size,
      type: songFile.type,
      extension: fileExtension,
      hash: fileHash
    })

    // Sanitize and upload song file with integrity verification
    const sanitizedSongFileName = songFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const songFileName = `${Date.now()}-${sanitizedSongFileName}-${fileHash.substring(0, 8)}.${fileExtension}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(songFileName, fileBuffer, {
        contentType: songFile.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Failed to upload song file: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Verify upload by downloading and checking hash
    const { data: verifyData, error: verifyError } = await supabase.storage
      .from('songs')
      .download(songFileName)

    if (verifyError) {
      console.error('Verification download error:', verifyError)
      // Try to clean up the failed upload
      await supabase.storage.from('songs').remove([songFileName])
      return NextResponse.json(
        { success: false, message: 'Song file upload verification failed' },
        { status: 500 }
      )
    }

    // Verify file integrity
    const verifyBuffer = await verifyData.arrayBuffer()
    const verifyHash = await calculateFileHash(verifyBuffer)
    
    if (fileHash !== verifyHash) {
      console.error('File integrity check failed:', { original: fileHash, uploaded: verifyHash })
      // Clean up the corrupted upload
      await supabase.storage.from('songs').remove([songFileName])
      return NextResponse.json(
        { success: false, message: 'Audio file corruption detected during upload. Please try again.' },
        { status: 500 }
      )
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('songs')
      .getPublicUrl(songFileName)

    console.log('Audio file uploaded and verified successfully:', {
      fileName: songFileName,
      publicUrl: urlData.publicUrl,
      originalName: songFile.name,
      fileSize: songFile.size,
      fileHash: fileHash
    })

    // Create artist record
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .insert({
        id: authData.user.id,
        name: artistName,
        email: email,
        bio: bio,
        image_url: bioImageUrl,
        website_link: website || null,
        status: 'pending', // Will be approved by admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (artistError) {
      console.error('Artist creation error:', artistError)
      // Clean up the uploaded file if artist creation fails
      await supabase.storage.from('songs').remove([songFileName])
      return NextResponse.json(
        { success: false, message: 'Failed to create artist profile' },
        { status: 500 }
      )
    }

    // Create song record as private song with enhanced metadata
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert({
        title: songName,
        artist_id: authData.user.id,
        audio_url: urlData.publicUrl,
        file_url: urlData.publicUrl, // Also set file_url for consistency
        file_size: songFile.size,
        file_hash: fileHash, // Store hash for future integrity checks
        vote_count: 0,
        vote_goal: 100,
        status: 'private', // Private song, not public yet
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (songError) {
      console.error('Song creation error:', songError)
      // Clean up the uploaded file if song creation fails
      await supabase.storage.from('songs').remove([songFileName])
      return NextResponse.json(
        { success: false, message: 'Failed to create song record' },
        { status: 500 }
      )
    }

    console.log('Artist signup completed successfully:', {
      artistId: authData.user.id,
      songId: songData.id,
      fileHash: fileHash
    })

    return NextResponse.json({
      success: true,
      message: 'Artist account created successfully! Please check your email to confirm your account. You can then login to access your dashboard.',
      artist: artistData,
      song: songData,
      fileHash: fileHash
    })

  } catch (error) {
    console.error('Artist signup error:', error)
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