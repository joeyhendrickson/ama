# Supabase Setup Guide - Step by Step

This guide will walk you through setting up Supabase for your personal website project.

## Step 1: Create or Access Your Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with your existing account

2. **Create a New Project** (or use existing)
   - Click "New Project"
   - Fill in:
     - **Name**: `launchthatsong` (or your preferred name)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to you (e.g., `US East (North Virginia)`)
   - Click "Create new project"
   - Wait 2-3 minutes for project to initialize

## Step 2: Get Your API Keys

1. **In your Supabase project dashboard**, click on the **Settings** icon (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key**: Click "Reveal" and copy this (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Add Keys to .env.local

1. **Open your `.env.local` file** in the project root
2. **Add these lines** (replace with your actual values):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Set Up Database Tables

**Simplified Setup:** This project uses a minimal schema for your personal website (not a multi-artist platform).

1. **In Supabase Dashboard**, click on **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Open the file **`supabase_minimal_schema.sql`** in your project root
4. Copy the **entire file contents** and paste into the SQL Editor
5. Click **"Run"**

**What this creates:**
- ✅ Artists table (with Joey Hendrickson pre-inserted)
- ✅ Songs table (for your music)
- ✅ Voice comments table
- ✅ Approval history table (simplified)
- ✅ Personal content table
- ✅ Topics table (with initial page data for consultant, projects, founder, speaker, music, etc.)
- ✅ Founder & speaker videos tables
- ✅ All indexes, RLS policies, and triggers

**Note:** This schema excludes old multi-artist platform features. See `ARTIST_FILES_ANALYSIS.md` for details on what was excluded.

## Step 5: Set Up Storage Bucket for Songs

1. **In Supabase Dashboard**, click **Storage** in the left sidebar
2. Click **New bucket**
3. **Bucket name**: `songs`
4. **Public bucket**: ✅ Check this (so songs can be accessed publicly)
5. Click **Create bucket**

**Note:** RLS policies and security are already set up in the `supabase_minimal_schema.sql` file you ran in Step 4. The schema includes:
- ✅ RLS enabled on all tables
- ✅ Public read policies for approved/published content
- ✅ Admin operations use service role key (bypasses RLS)

## Step 6: Verify Setup

1. **Restart your Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Check the browser console** for any Supabase connection errors

3. **Test the admin dashboard**:
   - Go to `http://localhost:3000`
   - Type "I am Joey Hendrickson" in the search bar
   - Log in with:
     - Username: `JoeyHendrickson`
     - Password: `Voyetra070105!`
   - You should see the admin dashboard

**Note:** Initial topics data is already included in the schema (consultant, projects, founder, speaker, music, travel-santa-marta, author, personal-ai-os). You can edit these through the admin dashboard's "Topics" tab.

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure there are no extra spaces or quotes around the keys
- Restart your dev server after changing `.env.local`

### "Row Level Security policy violation"
- The schema includes RLS policies - make sure you ran the full `supabase_minimal_schema.sql` file
- Check that your data has the correct status (`approved`, `is_published`, etc.)
- Admin operations use service role key which bypasses RLS

### Tables not found
- Make sure you ran the complete `supabase_minimal_schema.sql` file
- Check the SQL Editor for any error messages
- Verify tables exist in Supabase Dashboard → Table Editor

### Storage bucket issues
- Make sure the `songs` bucket is set to public
- Check bucket policies in Storage settings

### "Artist not found" errors
- The schema pre-inserts Joey Hendrickson as an artist
- Check the `artists` table in Supabase Dashboard to verify the record exists

## Next Steps

After Supabase is set up, you can:
1. Configure other services (Gemini, Pinecone, etc.) - see `ENV_VARIABLES.md`
2. Upload songs through the admin dashboard
3. Add personal content and topics
4. Test the AI search functionality

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the project's `ENV_VARIABLES.md` for other required keys

