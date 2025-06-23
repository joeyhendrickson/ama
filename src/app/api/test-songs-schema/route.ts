import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // Try to get the table structure by attempting a simple query
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    // Try to insert a minimal test record to see what fields are required
    const testInsert = await supabase
      .from('songs')
      .insert({
        title: 'Test Song',
        artist_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
      })
      .select()

    return NextResponse.json({
      success: true,
      message: 'Songs table structure check',
      existingData: data,
      testInsert: testInsert,
      existingFields: data && data.length > 0 ? Object.keys(data[0]) : []
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 