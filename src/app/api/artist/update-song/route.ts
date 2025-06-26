import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { songId, title, genre, votePrice, voteGoal } = await request.json()

    // Validate required fields
    if (!songId || !title || votePrice === undefined || voteGoal === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate vote price and goal
    if (votePrice < 0.01) {
      return NextResponse.json(
        { success: false, message: 'Contribution amount must be at least $0.01' },
        { status: 400 }
      )
    }

    if (voteGoal < 1) {
      return NextResponse.json(
        { success: false, message: 'Contribution goal must be at least 1' },
        { status: 400 }
      )
    }

    // Update the song in the database
    const { data, error } = await supabase
      .from('songs')
      .update({
        title: title.trim(),
        genre: genre?.trim() || null,
        vote_price: votePrice,
        vote_goal: voteGoal,
        updated_at: new Date().toISOString()
      })
      .eq('id', songId)
      .select()

    if (error) {
      console.error('Error updating song:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update song' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Song not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Song updated successfully',
      song: data[0]
    })

  } catch (error) {
    console.error('Error in update-song API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 