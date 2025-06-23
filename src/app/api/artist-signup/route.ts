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
    const message = formData.get('message') as string
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

    // Upload bio image to Supabase Storage
    const bioImageName = `bio-${Date.now()}-${bioImage.name}`
    const { data: bioUploadData, error: bioUploadError } = await supabase.storage
      .from('artist-images')
      .upload(bioImageName, bioImage)

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
      .getPublicUrl(bioImageName)

    // Upload song file to Supabase Storage
    const songFileName = `${Date.now()}-${songFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(songFileName, songFile)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Failed to upload song file' },
        { status: 500 }
      )
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('songs')
      .getPublicUrl(songFileName)

    // Create artist record
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .insert({
        id: authData.user.id,
        name: artistName,
        email: email,
        bio: bio,
        image_url: bioUrlData.publicUrl,
        website_url: website || null,
        status: 'pending', // Will be approved by admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (artistError) {
      console.error('Artist creation error:', artistError)
      return NextResponse.json(
        { success: false, message: 'Failed to create artist profile' },
        { status: 500 }
      )
    }

    // Create song record as private song
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert({
        title: songName,
        artist_id: authData.user.id,
        audio_url: urlData.publicUrl,
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
      return NextResponse.json(
        { success: false, message: 'Failed to create song record' },
        { status: 500 }
      )
    }

    // Send custom confirmation email
    try {
      const emailResponse = await fetch(`${request.nextUrl.origin}/api/notify-artist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: authData.user.id,
          artistName: artistName,
          email: email,
          type: 'signup_confirmation'
        })
      })

      if (!emailResponse.ok) {
        console.error('Failed to send confirmation email')
      }
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Artist account created successfully! Please check your email to verify your account.',
      artistId: authData.user.id,
      songId: songData.id
    })

  } catch (error) {
    console.error('Artist signup error:', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 