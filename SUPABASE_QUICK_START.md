# Supabase Quick Start Checklist

Follow these steps in order:

## ✅ Step 1: Get Your Supabase Keys (5 minutes)

1. Go to https://supabase.com/dashboard
2. Sign in or create account
3. Click **"New Project"** (or select existing)
   - Name: `JoeyHendrickson-ama`
   - Set a database password (save it!)
   - Choose region
   - Wait 2-3 minutes for setup
4. Go to **Settings** → **API**
5. Copy these 3 values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long JWT token)
   - **service_role key** (click "Reveal" to see it)

## ✅ Step 2: Add to .env.local (2 minutes)

Open `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** No quotes, no spaces around the `=` sign!

## ✅ Step 3: Create Database Tables (5 minutes)

In Supabase Dashboard → **SQL Editor**:

1. Click **"New Query"**
2. Open the file **`supabase_minimal_schema.sql`** in your project
3. Copy the **entire contents** and paste into the SQL Editor
4. Click **"Run"**

**That's it!** This single file creates:
- ✅ Artists table (with Joey Hendrickson pre-inserted)
- ✅ Songs table
- ✅ Voice comments table
- ✅ Approval history table
- ✅ Personal content table
- ✅ Topics table (with initial page data)
- ✅ Founder & speaker videos tables
- ✅ All indexes and security policies

**Note:** This is a **simplified schema** for your personal website. It excludes the old multi-artist platform features you don't need.

## ✅ Step 4: Set Up Storage (2 minutes)

1. In Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Name: `songs`
4. ✅ Check **"Public bucket"**
5. Click **"Create bucket"**

## ✅ Step 5: Test It (1 minute)

1. Restart your dev server:
   ```bash
   npm run dev
   ```
2. Go to http://localhost:3000
3. Try the admin login:
   - Type "I am Joey Hendrickson" in search
   - Username: `JoeyHendrickson`
   - Password: `Voyetra070105!`

## 🎉 Done!

Your Supabase is now set up. The app should work without errors.

---

## Need More Details?

See the full guide: `SUPABASE_SETUP_GUIDE.md`

## Common Issues

**"Invalid API key"**
- Check `.env.local` has no quotes or spaces
- Restart dev server after changing `.env.local`

**"Table doesn't exist"**
- Make sure you ran all the SQL files
- Check SQL Editor for error messages

**"Row Level Security policy violation"**
- The SQL files include RLS policies
- Make sure you ran them all

