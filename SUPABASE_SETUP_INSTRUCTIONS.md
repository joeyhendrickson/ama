# Supabase Setup Instructions

## Overview
This is a **NEW** Supabase project for Joey Hendrickson's personal website.

## Quick Start

1. **Create a new Supabase project** at https://supabase.com
   - Project Name: `JoeyHendrickson-ama`
2. **Run the complete schema** in the SQL Editor:
   - Open `supabase_complete_schema.sql`
   - Copy and paste the entire file into Supabase SQL Editor
   - Click "Run"

## What's Included

The schema includes all tables needed for:

### Core Features
- ✅ **Music** - Songs with streaming, downloads, and voice comments
- ✅ **Books** - Digital books with AI personalization
- ✅ **Admin Dashboard** - Single-user admin system
- ✅ **RAG/Search** - Topics and personal content for AI search
- ✅ **Videos** - Founder and speaker video management
- ✅ **Purchases** - Stripe and PayPal payment tracking

### Tables Created

1. **admin_users** - Admin authentication
2. **users** - Simple user tracking
3. **songs** - Music management with analytics
4. **books** - Book catalog with AI personalization
5. **book_purchases** - Book purchase tracking
6. **voice_comments** - Voice comments for songs
7. **purchase_transactions** - All purchase records
8. **approval_history** - Admin approval tracking
9. **topics** - Website pages for RAG/search
10. **personal_content** - Personal stories for RAG
11. **founder_videos** - Founder video management
12. **speaker_videos** - Speaker video management

## Storage Buckets Setup

After running the schema, set up Supabase Storage:

### 1. Songs Bucket
```sql
-- In Supabase Dashboard > Storage > Create Bucket
Bucket Name: songs
Public: Yes
File Size Limit: 50MB
Allowed MIME Types: audio/*, image/*
```

### 2. Books Bucket
```sql
-- In Supabase Dashboard > Storage > Create Bucket
Bucket Name: books
Public: Yes
File Size Limit: 100MB
Allowed MIME Types: application/pdf, application/epub+zip, image/*
```

## Environment Variables

Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# PayPal (for payments)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# AI/RAG
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
GOOGLE_DRIVE_ACCESS_TOKEN=your_drive_token

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Admin Login

Default admin user is created:
- **Email**: joeyhendrickson@me.com
- **Role**: super_admin

Admin login is handled via cookie-based authentication (see `/api/admin/login`).

## RAG/Search Setup

The RAG system uses:
- **Topics table** - Website page content
- **Personal content table** - Personal stories
- **Google Drive** - Files ingested into Pinecone
- **Gemini/OpenAI** - For generating responses

To update the AI knowledge base:
1. Go to Admin Dashboard
2. Click "Update AI" button
3. This ingests Google Drive files into Pinecone

## Payment Setup

### Stripe
1. Create a Stripe account
2. Get your secret key and webhook secret
3. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
4. All payments go directly to your Stripe account (no Connect needed)

### PayPal
1. Create a PayPal developer account
2. Create an app to get client ID and secret
3. Use sandbox for testing, production for live

## Next Steps

1. ✅ Run `supabase_complete_schema.sql` in Supabase
2. ✅ Set up storage buckets
3. ✅ Add environment variables
4. ✅ Test admin login
5. ✅ Upload first song via admin dashboard
6. ✅ Test payment flow
7. ✅ Update AI knowledge base

## Notes

- This is a **single-user personal website** (not multi-tenant)
- All content is managed through the admin dashboard
- No artist signups or multi-artist features
- All payments go to Joey's accounts (Stripe/PayPal)

