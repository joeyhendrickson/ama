import { NextRequest, NextResponse } from 'next/server'
import { getPineconeIndex } from '@/lib/pinecone'
import { generateEmbedding } from '@/lib/embeddings'

// Query Pinecone for relevant content
export async function POST(req: NextRequest) {
  try {
    const { query, topK = 5 } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Query Pinecone
    const index = await getPineconeIndex()
    const namespace = 'google-drive'
    
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
    })

    // Format results
    const results = queryResponse.matches.map(match => ({
      score: match.score,
      text: match.metadata?.text || '',
      fileName: match.metadata?.fileName || '',
      fileId: match.metadata?.fileId || '',
      webViewLink: match.metadata?.webViewLink || '',
      mimeType: match.metadata?.mimeType || '',
    }))

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length
    })

  } catch (error: any) {
    console.error('Pinecone query error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

