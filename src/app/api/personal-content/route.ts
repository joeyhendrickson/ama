import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET - Fetch personal content by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('personal_content')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch personal content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: data || []
    })
  } catch (error: any) {
    console.error('Personal content API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update personal content (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, category, title, content, is_published } = body

    if (!category || !title || !content) {
      return NextResponse.json(
        { error: 'Category, title, and content are required' },
        { status: 400 }
      )
    }

    const contentData = {
      category,
      title,
      content,
      is_published: is_published ?? false,
      updated_at: new Date().toISOString()
    }

    let result
    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('personal_content')
        .update(contentData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('personal_content')
        .insert([{ ...contentData, created_at: new Date().toISOString() }])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      content: result
    })
  } catch (error: any) {
    console.error('Personal content POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete personal content (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('personal_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error: any) {
    console.error('Personal content DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

