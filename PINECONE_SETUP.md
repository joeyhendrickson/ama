# Pinecone RAG Setup Guide

## Overview

You're correct - Google Drive files need to be ingested into Pinecone for the RAG system to work. I've created the complete integration. Here's what's been set up:

## What's Been Created

### 1. **Pinecone Client Library** (`src/lib/pinecone.ts`)
- Connects to your Pinecone index
- Uses the "ama-knowledge" index (1536 dimensions, cosine metric)

### 2. **Embeddings Library** (`src/lib/embeddings.ts`)
- Uses OpenAI's `text-embedding-3-small` model (matches your Pinecone config)
- Generates 1536-dimensional embeddings

### 3. **Ingestion API** (`/api/pinecone/ingest-drive`)
- Fetches all files from Google Drive
- Extracts text content from:
  - Google Docs
  - Google Sheets
  - Plain text files
  - (PDF and image support can be added later)
- Chunks large documents (1000 chars with 200 char overlap)
- Generates embeddings
- Upserts to Pinecone in the "google-drive" namespace

### 4. **Query API** (`/api/pinecone/query`)
- Takes a user query
- Generates embedding for the query
- Searches Pinecone for relevant content
- Returns top K results with metadata

### 5. **Updated AI Search**
- Now queries Pinecone instead of just listing file names
- Gets actual relevant content from Google Drive files
- Includes this in the RAG context for AI responses

## Required Environment Variables

Add these to your `.env.local`:

```bash
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=ama-knowledge
PINECONE_ENVIRONMENT=us-east-1

# OpenAI (for embeddings - you already have this)
OPENAI_API_KEY=your_openai_api_key

# Google Drive (you already have this)
GOOGLE_DRIVE_ACCESS_TOKEN=your_google_drive_access_token
```

## How to Ingest Google Drive Files

### Option 1: Ingest All Files (Recommended)

Make a POST request to the ingestion endpoint:

```bash
curl -X POST http://localhost:3000/api/pinecone/ingest-drive \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or use a tool like Postman, or create a simple admin page button.

### Option 2: Ingest Specific Folder

```bash
curl -X POST http://localhost:3000/api/pinecone/ingest-drive \
  -H "Content-Type: application/json" \
  -d '{"folderId": "your_google_drive_folder_id"}'
```

### Option 3: Create Admin Dashboard Button

You can add a button to your admin dashboard to trigger ingestion.

## What Happens During Ingestion

1. **Fetches Files**: Gets all files from Google Drive (or specific folder)
2. **Extracts Text**: Converts Google Docs, Sheets, and text files to plain text
3. **Chunks Documents**: Splits large files into 1000-character chunks with 200-character overlap
4. **Generates Embeddings**: Creates embeddings using OpenAI's text-embedding-3-small
5. **Upserts to Pinecone**: Stores vectors in the "google-drive" namespace
6. **Progress Logging**: Shows progress in server console

## Current Limitations

- **PDFs**: Not yet extracted (would need `pdf-parse` library)
- **Images**: Not yet extracted (would need OCR service)
- **Large Files**: Currently chunks at 1000 chars - may need adjustment

## Testing the Integration

1. **Ingest files** (see above)
2. **Test query**:
   ```bash
   curl -X POST http://localhost:3000/api/pinecone/query \
     -H "Content-Type: application/json" \
     -d '{"query": "What projects has Joey worked on?", "topK": 5}'
   ```
3. **Try AI search** on homepage - it should now include relevant Google Drive content

## Next Steps

1. Add Pinecone API key to `.env.local`
2. Run the ingestion endpoint to populate Pinecone
3. Test queries to verify it's working
4. The AI search will automatically use Pinecone results

## Monitoring

- Check Pinecone dashboard to see record count increase
- Check server logs during ingestion for progress
- Query endpoint returns scores - higher = more relevant

## Troubleshooting

- **"PINECONE_API_KEY is not set"**: Add it to `.env.local` and restart server
- **"No records found"**: Run the ingestion endpoint first
- **"Google Drive API error"**: Check your access token
- **Slow ingestion**: Large files take time - check server logs for progress

