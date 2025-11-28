import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET - Fetch all topics or a specific topic
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    let query = supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true })

    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, topics: data || [] })
  } catch (error: any) {
    console.error('Unexpected error fetching topics:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update a topic
export async function POST(request: NextRequest) {
  try {
    const { id, topic_id, title, description, route, content, ontology, metadata, is_active } = await request.json()

    if (!topic_id || !title || !route || !content) {
      return NextResponse.json(
        { success: false, error: 'topic_id, title, route, and content are required' },
        { status: 400 }
      )
    }

    let dbCall
    if (id) {
      // Update existing topic
      dbCall = supabase
        .from('topics')
        .update({ 
          title, 
          description, 
          route, 
          content, 
          ontology: ontology || null, 
          metadata: metadata || null,
          is_active: is_active !== undefined ? is_active : true
        })
        .eq('id', id)
    } else {
      // Insert new topic
      dbCall = supabase
        .from('topics')
        .insert({ 
          topic_id,
          title, 
          description, 
          route, 
          content, 
          ontology: ontology || null, 
          metadata: metadata || null,
          is_active: is_active !== undefined ? is_active : true
        })
    }

    const { data, error } = await dbCall.select().single()

    if (error) {
      console.error('Error saving topic:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, topic: data })
  } catch (error: any) {
    console.error('Unexpected error saving topic:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a topic
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting topic:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Topic deleted successfully' })
  } catch (error: any) {
    console.error('Unexpected error deleting topic:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

