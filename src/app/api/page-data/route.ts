import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { allProjects, Project } from '@/data/projects'

// Extract projects data
async function getProjectsData(query?: string) {
  let projects = allProjects

  // Filter by query if provided
  if (query) {
    const lowerQuery = query.toLowerCase()
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2)
    
    projects = projects.filter(p => {
      const searchText = [
        p.title,
        p.client,
        p.description,
        p.budget || '',
        p.category,
        ...p.technologies,
        ...(p.achievements || [])
      ].join(' ').toLowerCase()
      
      // Check if any query word matches
      return queryWords.some(word => searchText.includes(word)) ||
             searchText.includes(lowerQuery)
    })
    
    // Sort by relevance (number of matches)
    projects.sort((a, b) => {
      const aText = [a.title, a.client, a.description, ...a.technologies].join(' ').toLowerCase()
      const bText = [b.title, b.client, b.description, ...b.technologies].join(' ').toLowerCase()
      
      const aMatches = queryWords.filter(w => aText.includes(w)).length
      const bMatches = queryWords.filter(w => bText.includes(w)).length
      
      return bMatches - aMatches
    })
  }

  // Calculate total budget
  const totalBudget = projects.reduce((sum, p) => {
    if (!p.budget) return sum
    const matches = p.budget.match(/\$([0-9.]+)([KMB])?/g)
    if (!matches || matches.length === 0) return sum
    
    let projectValue = 0
    matches.forEach(match => {
      const valueStr = match.replace('$', '')
      let value = parseFloat(valueStr)
      if (valueStr.includes('K')) {
        value *= 1000
      } else if (valueStr.includes('M')) {
        value *= 1000000
      } else if (valueStr.includes('B')) {
        value *= 1000000000
      }
      if (value > projectValue) {
        projectValue = value
      }
    })
    return sum + projectValue
  }, 0)

  return {
    projects,
    totalProjects: projects.length,
    totalBudget: totalBudget / 1000000, // Convert to millions
    categories: [...new Set(projects.map(p => p.category))]
  }
}

// Extract consultant page data
async function getConsultantData(query?: string) {
  return {
    title: 'Consultant',
    description: 'Complex project management for Fortune 100 companies, startups, and cities',
    currentFocus: {
      title: 'Current Focus',
      content: 'My current focus is to integrate AI into small business and enterprise functions to support growth, advancement, and team value. I help organizations leverage artificial intelligence to automate processes, enhance decision-making, and create intelligent systems that drive measurable business outcomes.'
    },
    expertise: [
      { title: 'AI SaaS', description: 'Building and scaling AI-powered software solutions' },
      { title: 'Welding Robotics', description: 'Advanced robotics solutions for manufacturing automation' },
      { title: 'IoT Surgical Robotics', description: 'Connected medical device systems and surgical robotics' },
      { title: 'Global Order Promising', description: 'Supply chain optimization and fulfillment systems' },
      { title: 'E-commerce', description: 'Digital commerce platforms and strategies' },
      { title: 'Blockchain for Supply Chain', description: 'Transparent and traceable supply chain solutions' }
    ],
    recentEngagements: [
      { title: 'Path Robotics', description: 'Multi-arm robotics development - $1.4M', link: '/projects#path-robotics' },
      { title: 'InnateIQ', description: 'AI SaaS Product Vision - $500K+', link: '/projects#innateiq' },
      { title: 'Mayo Clinic', description: 'GCP Cloud Transformation - $120M+', link: '/projects#mayo-clinic' }
    ]
  }
}

// Extract music page data
async function getMusicData(query?: string) {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching songs:', error)
      return { songs: [] }
    }

    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase()
      const filtered = songs?.filter(s => 
        s.title?.toLowerCase().includes(lowerQuery) ||
        s.artist_name?.toLowerCase().includes(lowerQuery) ||
        s.genre?.toLowerCase().includes(lowerQuery)
      ) || []
      return { songs: filtered }
    }

    return { songs: songs || [] }
  } catch (error) {
    console.error('Music data error:', error)
    return { songs: [] }
  }
}

// Extract founder page data
async function getFounderData(query?: string) {
  try {
    const { data: videos, error } = await supabase
      .from('founder_videos')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching founder videos:', error)
      return { videos: [] }
    }

    return { videos: videos || [] }
  } catch (error) {
    console.error('Founder data error:', error)
    return { videos: [] }
  }
}

// Extract speaker page data
async function getSpeakerData(query?: string) {
  try {
    const { data: videos, error } = await supabase
      .from('speaker_videos')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching speaker videos:', error)
      return { videos: [] }
    }

    return { videos: videos || [] }
  } catch (error) {
    console.error('Speaker data error:', error)
    return { videos: [] }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    const query = searchParams.get('query') || undefined

    let data: any = null

    switch (pageId) {
      case 'projects':
        data = await getProjectsData(query)
        break
      case 'consultant':
        data = await getConsultantData(query)
        break
      case 'music':
        data = await getMusicData(query)
        break
      case 'founder':
        data = await getFounderData(query)
        break
      case 'speaker':
        data = await getSpeakerData(query)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid pageId' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      pageId,
      query,
      data
    })
  } catch (error: any) {
    console.error('Page data API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

