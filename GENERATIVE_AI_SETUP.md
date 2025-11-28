# Generative AI Homepage Setup

## Overview
The homepage is now fully generative, using Gemini 3 (or OpenAI GPT-4o as fallback) to create dynamic, visually formatted responses based on user questions. The system uses RAG (Retrieval-Augmented Generation) to pull context from all website pages and Google Drive files.

## Features Implemented

### 1. **Generative AI Integration**
- **Primary**: Gemini 2.0 Flash Experimental (or Gemini 1.5 Pro)
- **Fallback**: OpenAI GPT-4o
- Generates markdown-formatted, visually appealing responses
- Uses comprehensive RAG context from all website content

### 2. **RAG System** (`/api/rag-context`)
- Aggregates content from:
  - All projects (from `/data/projects.ts`)
  - Music/songs (from Supabase)
  - Founder videos (from Supabase)
  - Speaker videos (from Supabase)
  - Personal content (from Supabase)
  - Consultant information
  - Founder ventures
- Filters content by query relevance
- Provides comprehensive context for AI generation

### 3. **Google Drive Integration** (`/api/google-drive`)
- Structure in place for Google Drive API
- Will index thousands of personal files for RAG
- Currently returns file metadata
- Ready for full content extraction when configured

### 4. **Generative Display Component**
- Renders AI-generated markdown with beautiful styling
- Expandable/collapsible sections
- Rich formatting (headings, lists, tables, code blocks)
- Visual hierarchy and proper spacing

### 5. **Homepage Updates**
- Removed description text below name
- Search bar placeholder: "ask me anything"
- Fully generative responses based on user questions
- Uses all website pages as context database

## Environment Variables Required

Add these to your `.env.local`:

```env
# Gemini API (Primary)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API (Fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Google Drive API (Optional - for personal files RAG)
GOOGLE_DRIVE_ACCESS_TOKEN=your_google_drive_token_here
# OR use service account:
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## How It Works

1. **User asks a question** → e.g., "What robotics projects have you worked on?"

2. **RAG Context Fetching**:
   - `/api/rag-context` crawls all website pages
   - Extracts relevant content based on query
   - Includes projects, music, videos, personal content

3. **Google Drive Context** (if configured):
   - Searches Google Drive for relevant files
   - Adds file metadata to context

4. **AI Generation**:
   - Gemini/OpenAI receives query + full context
   - Generates comprehensive, formatted response
   - Uses markdown for rich formatting

5. **Display**:
   - `GenerativeDisplay` component renders markdown
   - Beautiful, interactive UI with expandable sections
   - Highlights relevant information

## Next Steps for Google Drive Integration

To fully enable Google Drive RAG:

1. **Set up Google Cloud Project**:
   - Create project in Google Cloud Console
   - Enable Google Drive API
   - Create OAuth 2.0 credentials or Service Account

2. **Authentication**:
   - Option A: OAuth 2.0 (for user's personal Drive)
   - Option B: Service Account (for shared Drive folder)

3. **File Processing**:
   - Extract text from:
     - Google Docs (via Docs API)
     - PDFs (via Drive API + text extraction)
     - Images (via Vision API for OCR)
     - Text files
   - Index content in vector database or searchable format

4. **Update `/api/google-drive/route.ts`**:
   - Implement file content extraction
   - Add to RAG context in `/api/rag-context/route.ts`

## API Routes

- `/api/ai-search` - Main search endpoint (uses RAG + Gemini)
- `/api/rag-context` - Aggregates all website content
- `/api/gemini-generate` - Generates AI responses
- `/api/google-drive` - Google Drive file access
- `/api/page-data` - Extracts structured data from pages

## Testing

1. Start the dev server: `npm run dev`
2. Go to homepage
3. Ask questions like:
   - "What projects have you worked on?"
   - "Tell me about your music"
   - "What are your values?"
   - "Tell me about robotics projects"
4. See generative, formatted responses appear below

## Notes

- The system gracefully falls back to OpenAI if Gemini is unavailable
- If no API keys are configured, shows helpful fallback message
- All responses are generated in real-time based on current website content
- Google Drive integration is ready but needs authentication setup

