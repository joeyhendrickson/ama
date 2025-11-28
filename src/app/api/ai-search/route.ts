import { NextRequest, NextResponse } from 'next/server'
import { siteOntology } from '../site-ontology/route'

// Enhanced AI search with RAG and Gemini integration

// Content mapping for different topics
const contentMap: Record<string, any> = {
  // Professional content
  'consultant': {
    type: 'page',
    pageId: 'consultant',
    title: 'Consulting Services',
    description: 'Digital consulting, web development, and AI solutions',
    route: '/consultant'
  },
  'projects': {
    type: 'page',
    pageId: 'projects',
    title: 'Projects Portfolio',
    description: '14+ years of cross-functional IT management projects',
    route: '/projects'
  },
  'founder': {
    type: 'page',
    pageId: 'founder',
    title: 'Founder & Entrepreneur',
    description: 'Entrepreneurial ventures and press coverage',
    route: '/founder'
  },
  'speaker': {
    type: 'page',
    pageId: 'speaker',
    title: 'Speaker & Presenter',
    description: 'Speaking engagements and panels',
    route: '/speaker'
  },
  'music': {
    type: 'page',
    pageId: 'music',
    title: 'Music',
    description: 'Stream and download music, create custom albums',
    route: '/music'
  },
  'travel': {
    type: 'page',
    pageId: 'travel-santa-marta',
    title: 'Travel Santa Marta',
    description: 'Book travel packages to Santa Marta, Colombia',
    route: '/travel-santa-marta'
  },
  'author': {
    type: 'page',
    pageId: 'author',
    title: 'Author',
    description: 'Digital books with personalized messaging',
    route: '/author'
  },
  // Personal content keywords
  'childhood': { type: 'personal', category: 'childhood' },
  'high school': { type: 'personal', category: 'high-school' },
  'college': { type: 'personal', category: 'college' },
  'invention': { type: 'personal', category: 'invention-process' },
  'travels': { type: 'personal', category: 'travels' },
  'dating': { type: 'personal', category: 'dating' },
  'faith': { type: 'personal', category: 'faith' },
  'marriage': { type: 'personal', category: 'marriage' },
  'values': { type: 'personal', category: 'values' },
  'hobbies': { type: 'personal', category: 'hobbies' },
  'gym': { type: 'personal', category: 'gym-routine' },
  'fitness': { type: 'personal', category: 'gym-routine' },
  'stories': { type: 'personal', category: 'personal-stories' }
}

// Simple keyword matching (can be enhanced with AI/ML)
function findRelevantContent(query: string): any[] {
  const lowerQuery = query.toLowerCase()
  const results: any[] = []
  const matched = new Set<string>()

  // Check for direct matches
  for (const [keyword, content] of Object.entries(contentMap)) {
    if (lowerQuery.includes(keyword) && !matched.has(content.pageId || content.category)) {
      results.push(content)
      matched.add(content.pageId || content.category)
    }
  }

  // Check ontology pages
  for (const page of siteOntology.pages) {
    if (
      (lowerQuery.includes(page.title.toLowerCase()) ||
       lowerQuery.includes(page.id) ||
       page.description.toLowerCase().includes(lowerQuery) ||
       page.content.some((c: string) => c.toLowerCase().includes(lowerQuery))) &&
      !matched.has(page.id)
    ) {
      results.push({
        type: 'page',
        pageId: page.id,
        title: page.title,
        description: page.description,
        route: page.route,
        content: page.content
      })
      matched.add(page.id)
    }
  }

  return results
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Check for secret admin phrase
    if (query.toLowerCase().trim() === 'i am joey hendrickson') {
      return NextResponse.json({
        success: true,
        query,
        aiResponse: 'Admin access detected. Redirecting to login...',
        isAdminAccess: true,
        redirectTo: '/admin-login',
        relevantContent: [],
        suggestions: []
      })
    }

    // Step 1: Fetch RAG context from all pages (direct import)
    let context = ''
    try {
      const { GET: getRagContext } = await import('../rag-context/route')
      const ragRequest = new Request(
        `http://localhost/api/rag-context?query=${encodeURIComponent(query)}`,
        { method: 'GET' }
      )
      const ragContextResponse = await getRagContext(ragRequest)
      const ragContextData = await ragContextResponse.json()
      context = ragContextData.context || ''
    } catch (error) {
      console.error('Error fetching RAG context:', error)
      // Continue with empty context
    }

    // Step 2: Query Pinecone for Google Drive content (if configured)
    let driveContext = ''
    try {
      const { POST: queryPinecone } = await import('../pinecone/query/route')
      const pineconeRequest = new NextRequest(
        new URL('http://localhost/api/pinecone/query'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, topK: 5 })
        }
      )
      const pineconeResponse = await queryPinecone(pineconeRequest)
      const pineconeData = await pineconeResponse.json()
      
      if (pineconeData.success && pineconeData.results && pineconeData.results.length > 0) {
        driveContext = `\n\n=== RELEVANT GOOGLE DRIVE CONTENT ===\n`
        pineconeData.results.forEach((result: any) => {
          driveContext += `File: ${result.fileName}\n`
          driveContext += `Content: ${result.text}\n`
          driveContext += `---\n`
        })
      }
    } catch (error) {
      console.error('Pinecone query error:', error)
      // Continue without Drive context
    }

    const fullContext = context + driveContext

    // Step 3: Generate response using Gemini (or OpenAI fallback)
    // Call the generate function directly
    let aiResponse = 'I apologize, but I encountered an error generating a response.'
    let model = 'unknown'
    try {
      const { POST: generateContent } = await import('../gemini-generate/route')
      
      // Create a proper NextRequest object for the internal API call
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const generateRequest = new NextRequest(
        new URL(`${baseUrl}/api/gemini-generate`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            context: fullContext
          })
        }
      )
      
      const generateResponse = await generateContent(generateRequest)
      const generatedData = await generateResponse.json()
      
      // Check if there's an error in the response
      if (generatedData.error) {
        console.error('AI generation error:', generatedData.error)
        throw new Error(generatedData.error)
      }
      
      if (!generatedData.success) {
        console.error('AI generation failed:', generatedData)
        throw new Error('AI generation returned unsuccessful response')
      }
      
      aiResponse = generatedData.response || aiResponse
      model = generatedData.model || model
      
      console.log('AI response generated successfully:', {
        model,
        responseLength: aiResponse.length
      })
    } catch (error: any) {
      console.error('Error generating AI response:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        query,
        contextLength: fullContext.length
      })
      // Use fallback response
      aiResponse = `I'm here to help you learn about Joey! Based on your question "${query}", I can provide information from his professional portfolio, projects, music, and personal experiences. However, I'm having trouble generating a detailed response right now. Please try asking a more specific question.`
    }

    // Find relevant content
    let relevantContent = findRelevantContent(query)

    // Fetch full page data for matched pages
    const pageDataPromises = relevantContent
      .filter(c => c.type === 'page' && c.pageId)
      .map(async (item) => {
        try {
          // Import and call the page-data route handler directly
          const { GET } = await import('../page-data/route')
          const url = new URL(`http://localhost/api/page-data`)
          url.searchParams.set('pageId', item.pageId)
          if (query) {
            url.searchParams.set('query', query)
          }
          const request = new Request(url.toString(), { method: 'GET' })
          const response = await GET(request)
          const pageData = await response.json()
          if (pageData.success) {
            return {
              ...item,
              pageData: pageData.data,
              hasData: true
            }
          }
        } catch (error) {
          console.error(`Error fetching page data for ${item.pageId}:`, error)
        }
        return {
          ...item,
          hasData: false
        }
      })

    const enrichedPageContent = await Promise.all(pageDataPromises)
    relevantContent = relevantContent.map(c => {
      if (c.type === 'page' && c.pageId) {
        const enriched = enrichedPageContent.find(epc => epc.pageId === c.pageId)
        return enriched || c
      }
      return c
    })

    // If personal content category matched, fetch actual content
    const personalContentItems = relevantContent.filter(c => c.type === 'personal')
    if (personalContentItems.length > 0) {
      try {
        // Import supabase client for direct database access
        const { supabase } = await import('@/lib/supabaseClient')
        
        const personalContentPromises = personalContentItems.map(async (item) => {
          const { data, error } = await supabase
            .from('personal_content')
            .select('*')
            .eq('category', item.category)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
          
          if (!error && data && data.length > 0) {
            return {
              ...item,
              actualContent: data,
              hasContent: true
            }
          }
          return {
            ...item,
            hasContent: false
          }
        })
        const enrichedPersonalContent = await Promise.all(personalContentPromises)
        relevantContent = relevantContent.map(c => {
          if (c.type === 'personal') {
            const enriched = enrichedPersonalContent.find(epc => epc.category === c.category)
            return enriched || c
          }
          return c
        })
      } catch (error) {
        console.error('Error fetching personal content:', error)
      }
    }

    // Fetch Google Drive content if available (for future RAG enhancement)
    // This will be implemented when Google Drive API is fully configured

    // Generate suggestions based on query
    const suggestions: string[] = [
      'What projects has Joey worked on?',
      'Tell me about Joey\'s music',
      'What are Joey\'s values?',
      'Tell me about Joey\'s travels',
      'What is Joey\'s consulting work?'
    ]

    return NextResponse.json({
      success: true,
      query,
      aiResponse,
      relevantContent,
      suggestions,
      model: model,
      isGenerative: true
    })
  } catch (error: any) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

