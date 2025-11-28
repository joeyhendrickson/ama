import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

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

    // Check if user is admin (admin@launchthatsong.com or admin_users table)
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

    const formData = await request.formData()
    const title = formData.get('title') as string
    const artistName = formData.get('artist_name') as string || 'Joey Hendrickson'
    const genre = formData.get('genre') as string || 'Alternative • Acoustic'
    const file = formData.get('file') as File
    const imageFile = formData.get('image') as File | null

    if (!title || !file) {
      return NextResponse.json(
        { success: false, message: 'Title and audio file are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an audio file' },
        { status: 400 }
      )
    }

    // Upload audio file to Supabase Storage
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const audioFileName = `songs/${Date.now()}-${sanitizedFileName}`
    
    const { data: audioUploadData, error: audioUploadError } = await supabase.storage
      .from('songs')
      .upload(audioFileName, file, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (audioUploadError) {
      console.error('Audio upload error:', audioUploadError)
      return NextResponse.json(
        { success: false, message: `Failed to upload audio: ${audioUploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL for audio
    const { data: audioUrlData } = supabase.storage
      .from('songs')
      .getPublicUrl(audioFileName)
    const audioUrl = audioUrlData.publicUrl

    // Upload image if provided
    let imageUrl: string | null = null
    if (imageFile) {
      const sanitizedImageName = imageFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
      const imageFileName = `song-images/${Date.now()}-${sanitizedImageName}`
      
      const { data: imageUploadData, error: imageUploadError } = await supabase.storage
        .from('songs')
        .upload(imageFileName, imageFile, {
          contentType: imageFile.type,
          cacheControl: '3600'
        })

      if (!imageUploadError) {
        const { data: imageUrlData } = supabase.storage
          .from('songs')
          .getPublicUrl(imageFileName)
        imageUrl = imageUrlData.publicUrl
      }
    }

    // Create song record in database
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert({
        title,
        artist_name: artistName,
        genre,
        audio_url: audioUrl,
        image_url: imageUrl,
        file_url: audioUrl,
        file_size: file.size,
        status: 'approved',
        is_public: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (songError) {
      console.error('Database error:', songError)
      return NextResponse.json(
        { success: false, message: `Error saving song: ${songError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Song uploaded successfully',
      song: songData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

