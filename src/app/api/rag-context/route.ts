import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { allProjects } from '@/data/projects'

// RAG System - Aggregates all website content for context
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''

    const context: string[] = []

    // 1. Projects Data
    context.push('=== PROJECTS PORTFOLIO ===')
    context.push(`Total Projects: ${allProjects.length}`)
    allProjects.forEach(project => {
      context.push(`- ${project.title} (${project.client}): ${project.description}`)
      context.push(`  Period: ${project.period}, Budget: ${project.budget || 'N/A'}`)
      context.push(`  Technologies: ${project.technologies.join(', ')}`)
      if (project.achievements) {
        context.push(`  Achievements: ${project.achievements.join('; ')}`)
      }
    })

    // 2. Music Data
    try {
      const { data: songs } = await supabase
        .from('songs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (songs && songs.length > 0) {
        context.push('\n=== MUSIC ===')
        context.push(`Total Songs: ${songs.length}`)
        songs.forEach((song: any) => {
          context.push(`- ${song.title} by ${song.artist_name} (${song.genre || 'Unknown genre'})`)
        })
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    }

    // 3. Founder Videos
    try {
      const { data: videos } = await supabase
        .from('founder_videos')
        .select('*')
        .order('year', { ascending: false })

      if (videos && videos.length > 0) {
        context.push('\n=== FOUNDER VIDEOS & PRESS ===')
        videos.forEach((video: any) => {
          context.push(`- ${video.title} (${video.outlet || 'Unknown outlet'}, ${video.year || 'Unknown year'})`)
          if (video.description) {
            context.push(`  ${video.description}`)
          }
        })
      }
    } catch (error) {
      console.error('Error fetching founder videos:', error)
    }

    // 4. Speaker Videos
    try {
      const { data: speakerVideos } = await supabase
        .from('speaker_videos')
        .select('*')
        .order('year', { ascending: false })

      if (speakerVideos && speakerVideos.length > 0) {
        context.push('\n=== SPEAKING ENGAGEMENTS ===')
        speakerVideos.forEach((video: any) => {
          context.push(`- ${video.title} at ${video.event || 'Unknown event'} (${video.year || 'Unknown year'})`)
          if (video.location) {
            context.push(`  Location: ${video.location}`)
          }
          if (video.description) {
            context.push(`  ${video.description}`)
          }
        })
      }
    } catch (error) {
      console.error('Error fetching speaker videos:', error)
    }

    // 5. Personal Content
    try {
      const { data: personalContent } = await supabase
        .from('personal_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (personalContent && personalContent.length > 0) {
        context.push('\n=== PERSONAL CONTENT ===')
        personalContent.forEach((content: any) => {
          context.push(`[${content.category.replace('-', ' ').toUpperCase()}] ${content.title}`)
          context.push(content.content.substring(0, 500) + (content.content.length > 500 ? '...' : ''))
        })
      }
    } catch (error) {
      console.error('Error fetching personal content:', error)
    }

    // 6. Consultant Information
    context.push('\n=== CONSULTING SERVICES ===')
    context.push('Digital Consulting: Complex project management for Fortune 100 companies, startups, and cities')
    context.push('Web & Platform Development: Custom web applications and platforms')
    context.push('AI Solutions: Integrating AI into small business and enterprise functions')
    context.push('Current Focus: Integrating AI into small business and enterprise functions to support growth, advancement, and team value')
    context.push('Areas of Expertise: AI SaaS, Welding Robotics, IoT Surgical Robotics, Global Order Promising, E-commerce, Blockchain for Supply Chain, Digital Marketing Transformation, Rapid User Growth')

    // 7. Founder Projects
    const founderProjects = allProjects.filter(p => 
      p.client.toLowerCase().includes('founder') || 
      p.id.includes('columbus-songwriters') ||
      p.id.includes('the-parlor') ||
      p.id.includes('local-music-shelf') ||
      p.id.includes('lamp-amp') ||
      p.id.includes('hidden-drive-in') ||
      p.id.includes('smart-sound')
    )
    
    if (founderProjects.length > 0) {
      context.push('\n=== FOUNDER VENTURES ===')
      founderProjects.forEach(project => {
        context.push(`- ${project.title}: ${project.description}`)
        context.push(`  Status: ${project.period}, Impact: ${project.budget || 'N/A'}`)
      })
    }

    // 8. Topics (Admin-editable page content)
    try {
      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true })

      if (topicsData && topicsData.length > 0) {
        context.push('\n=== TOPICS (WEBSITE PAGES) ===')
        topicsData.forEach((topic: any) => {
          context.push(`\n[${topic.title}] (${topic.route})`)
          context.push(`Description: ${topic.description || 'N/A'}`)
          context.push(`Content: ${topic.content}`)
          
          if (topic.ontology && typeof topic.ontology === 'object') {
            if (topic.ontology.sections && Array.isArray(topic.ontology.sections)) {
              context.push(`Sections: ${topic.ontology.sections.join(', ')}`)
            }
            if (topic.ontology.keyPoints && Array.isArray(topic.ontology.keyPoints)) {
              context.push(`Key Points: ${topic.ontology.keyPoints.join('; ')}`)
            }
            if (topic.ontology.categories && Array.isArray(topic.ontology.categories)) {
              context.push(`Categories: ${topic.ontology.categories.join(', ')}`)
            }
          }
          
          if (topic.metadata && typeof topic.metadata === 'object') {
            if (topic.metadata.keyProjects && Array.isArray(topic.metadata.keyProjects)) {
              context.push(`Key Projects: ${topic.metadata.keyProjects.join(', ')}`)
            }
            if (topic.metadata.achievements && Array.isArray(topic.metadata.achievements)) {
              context.push(`Achievements: ${topic.metadata.achievements.join('; ')}`)
            }
          }
        })
      }
    } catch (error) {
      console.error('Error fetching topics for RAG:', error)
    }

    // Filter context by query if provided
    let filteredContext = context
    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredContext = context.filter(line => 
        line.toLowerCase().includes(lowerQuery) ||
        lowerQuery.split(/\s+/).some(word => word.length > 2 && line.toLowerCase().includes(word))
      )
      // Always include section headers
      const headers = context.filter(line => line.startsWith('==='))
      filteredContext = [...new Set([...headers, ...filteredContext])]
    }

    return NextResponse.json({
      success: true,
      context: filteredContext.join('\n'),
      totalLength: filteredContext.length,
      query: query || null
    })
  } catch (error: any) {
    console.error('RAG context error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
