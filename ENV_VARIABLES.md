# Environment Variables Configuration

This document lists all environment variables needed for the `.env.local` file.

## Required Environment Variables

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Google Gemini API (Primary AI Model)
```bash
GEMINI_API_KEY=your_gemini_api_key
```
**How to get:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `.env.local`

### OpenAI API (Fallback AI Model)
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id
```
**How to get:**
1. Go to https://platform.openai.com/api-keys
2. Sign in and create a new API key
3. Copy the key and add it to `.env.local`

### Google Drive API (for RAG with personal files)
```bash
GOOGLE_DRIVE_ACCESS_TOKEN=your_google_drive_access_token
```

**How to set up Google Drive API:**
1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials (OAuth client ID)
5. For a simple setup, you can use a temporary access token
6. For production, you'll want to set up:
   - `GOOGLE_DRIVE_CLIENT_ID`
   - `GOOGLE_DRIVE_CLIENT_SECRET`
   - `GOOGLE_DRIVE_REFRESH_TOKEN`
   - Or use a service account with domain-wide delegation

**Quick setup for testing:**
1. Use Google OAuth Playground: https://developers.google.com/oauthplayground/
2. Select "Drive API v3" scopes
3. Authorize and get an access token
4. Use that token temporarily (it expires in 1 hour)

### Pinecone (Vector Database for RAG)
```bash
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=ama-knowledge
PINECONE_ENVIRONMENT=us-east-1
```

**How to get:**
1. Go to https://app.pinecone.io/
2. Sign in and create an index (or use existing "ama-knowledge")
3. Get your API key from the dashboard
4. Set the index name (default: "ama-knowledge")
5. Set the environment/region (default: "us-east-1")

**Note:** Pinecone is used to store embeddings of Google Drive files for semantic search.

### PayPal Configuration
```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```
**For production, use:**
```bash
PAYPAL_BASE_URL=https://api-m.paypal.com
```

**How to get:**
1. Go to https://developer.paypal.com/
2. Create a sandbox account for testing
3. Create an app to get Client ID and Secret
4. For production, use live credentials

### Email/SMTP Configuration
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use that app password (not your regular password)

### Stripe Configuration (Optional - if using Stripe)
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Base URL
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
**For production:**
```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Node Environment
```bash
NODE_ENV=development
```

## Complete `.env.local` Template

Create a `.env.local` file in the root directory with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Models
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id

# Google Drive
GOOGLE_DRIVE_ACCESS_TOKEN=your_google_drive_access_token

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Priority Setup Order

1. **Essential for basic functionality:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **For AI search to work:**
   - `GEMINI_API_KEY` (or `OPENAI_API_KEY` as fallback)

3. **For Google Drive RAG (optional but recommended):**
   - `GOOGLE_DRIVE_ACCESS_TOKEN`

4. **For payments:**
   - PayPal credentials

5. **For email notifications:**
   - SMTP/Email credentials

## Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The app will work with fallbacks if some services aren't configured
- Google Drive integration is optional - the AI search will work without it
- OpenAI is used as a fallback if Gemini isn't configured

