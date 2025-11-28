import { NextRequest, NextResponse } from 'next/server'
import { getPineconeIndex } from '@/lib/pinecone'
import { generateEmbedding } from '@/lib/embeddings'

// Ingest Google Drive files into Pinecone
export async function POST(req: NextRequest) {
  try {
    const { folderId, accessToken } = await req.json()
    
    const driveAccessToken = accessToken || process.env.GOOGLE_DRIVE_ACCESS_TOKEN
    if (!driveAccessToken) {
      return NextResponse.json(
        { error: 'Google Drive access token is required' },
        { status: 400 }
      )
    }

    // Step 1: Fetch all files from Google Drive
    const files = await fetchGoogleDriveFiles(driveAccessToken, folderId)
    console.log(`Found ${files.length} files to process`)

    // Step 2: Extract text content from files
    const documents: Array<{ id: string; text: string; metadata: any }> = []
    
    for (const file of files) {
      try {
        const text = await extractFileContent(file, driveAccessToken)
        if (text && text.trim().length > 0) {
          // Split large documents into chunks (max 1000 chars per chunk)
          const chunks = chunkText(text, 1000, 200)
          
          chunks.forEach((chunk, idx) => {
            documents.push({
              id: `${file.id}_chunk_${idx}`,
              text: chunk,
              metadata: {
                fileId: file.id,
                fileName: file.name,
                mimeType: file.mimeType,
                modifiedTime: file.modifiedTime,
                webViewLink: file.webViewLink,
                chunkIndex: idx,
                totalChunks: chunks.length
              }
            })
          })
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        // Continue with other files
      }
    }

    console.log(`Extracted ${documents.length} document chunks`)

    // Step 3: Generate embeddings and upsert to Pinecone
    const index = await getPineconeIndex()
    const namespace = 'google-drive'
    
    let upserted = 0
    const batchSize = 100 // Process in batches to avoid rate limits

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      
      // Generate embeddings for batch
      const embeddings = await Promise.all(
        batch.map(doc => generateEmbedding(doc.text))
      )

      // Prepare vectors for Pinecone
      const vectors = batch.map((doc, idx) => ({
        id: doc.id,
        values: embeddings[idx],
        metadata: {
          ...doc.metadata,
          text: doc.text.substring(0, 1000) // Store first 1000 chars in metadata
        }
      }))

      // Upsert to Pinecone
      await index.namespace(namespace).upsert(vectors)
      upserted += batch.length
      
      console.log(`Upserted ${upserted}/${documents.length} chunks`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${upserted} document chunks from ${files.length} files`,
      filesProcessed: files.length,
      chunksCreated: documents.length
    })

  } catch (error: any) {
    console.error('Pinecone ingestion error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fetch all files from Google Drive
async function fetchGoogleDriveFiles(accessToken: string, folderId?: string) {
  const files: any[] = []
  let pageToken: string | undefined

  do {
    let url = 'https://www.googleapis.com/drive/v3/files?'
    url += 'fields=files(id,name,mimeType,modifiedTime,webViewLink,size),nextPageToken'
    url += '&pageSize=1000'
    
    if (folderId) {
      url += `&q='${folderId}' in parents`
    }
    
    if (pageToken) {
      url += `&pageToken=${pageToken}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`)
    }

    const data = await response.json()
    files.push(...(data.files || []))
    pageToken = data.nextPageToken
  } while (pageToken)

  return files
}

// Extract text content from various file types
async function extractFileContent(file: any, accessToken: string): Promise<string> {
  const { mimeType, id } = file

  // Google Docs
  if (mimeType === 'application/vnd.google-apps.document') {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    if (response.ok) {
      return await response.text()
    }
  }

  // Google Sheets
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/csv`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    if (response.ok) {
      return await response.text()
    }
  }

  // Plain text files
  if (mimeType?.startsWith('text/')) {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    if (response.ok) {
      return await response.text()
    }
  }

  // PDFs (would need PDF parsing library)
  if (mimeType === 'application/pdf') {
    // For now, return empty - would need pdf-parse or similar
    console.warn(`PDF extraction not yet implemented for ${file.name}`)
    return ''
  }

  // Images (would need OCR)
  if (mimeType?.startsWith('image/')) {
    // For now, return empty - would need OCR service
    console.warn(`Image OCR not yet implemented for ${file.name}`)
    return ''
  }

  return ''
}

// Chunk text into smaller pieces with overlap
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.substring(start, end))
    start = end - overlap
  }

  return chunks
}

