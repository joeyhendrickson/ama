import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name')

    console.log('Received name:', name)

    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('artists')
      .select('id, email')
      .eq('name', name)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Supabase query failed' }, { status: 500 })
    }

    if (!data) {
      console.warn('No artist found for:', name)
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    console.log('Artist found:', data)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error in lookup-artist route:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}