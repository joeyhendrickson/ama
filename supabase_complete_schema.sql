-- ============================================
-- COMPLETE SUPABASE SCHEMA FOR PERSONAL WEBSITE
-- ============================================
-- This schema is designed for Joey Hendrickson's personal website
-- Includes: Music, Books, Admin, Content Management, RAG/Search
-- Run this in your NEW Supabase project SQL Editor
-- ============================================

-- ============================================
-- 1. ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (Joey Hendrickson)
INSERT INTO admin_users (email, role, is_active)
VALUES ('joeyhendrickson@me.com', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- ============================================
-- 2. USERS TABLE (Simple user tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. SONGS TABLE (Music Management)
-- ============================================
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL DEFAULT 'Joey Hendrickson',
  genre TEXT,
  
  -- File paths (Supabase Storage)
  audio_path TEXT, -- Path in storage bucket
  audio_url TEXT, -- Public URL for streaming
  image_path TEXT, -- Cover image path
  image_url TEXT, -- Cover image public URL
  
  -- Download files
  file_url TEXT, -- Download URL (may differ from stream URL)
  file_size INTEGER, -- File size in bytes
  
  -- Status and visibility
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_public BOOLEAN DEFAULT false,
  submitted_for_approval BOOLEAN DEFAULT false,
  
  -- Analytics
  stream_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for songs
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_public ON songs(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_songs_created ON songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_streams ON songs(stream_count DESC);

-- ============================================
-- 4. BOOKS TABLE (Author Page)
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  file_url TEXT, -- PDF or EPUB download URL
  file_size INTEGER,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  
  -- AI Personalization
  ai_personalization_enabled BOOLEAN DEFAULT false,
  ai_personalization_prompt TEXT, -- Admin-controlled prompt for AI-generated messages
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  
  -- Analytics
  purchase_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for books
CREATE INDEX IF NOT EXISTS idx_books_published ON books(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_books_available ON books(is_available) WHERE is_available = true;

-- ============================================
-- 5. BOOK PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS book_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  
  -- Customer info
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  
  -- Payment info
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal')),
  payment_intent_id TEXT, -- Stripe payment intent or PayPal order ID
  amount_paid DECIMAL(10, 2) NOT NULL,
  
  -- AI Personalization
  personalized_message TEXT, -- AI-generated personalized message
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Download tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for book purchases
CREATE INDEX IF NOT EXISTS idx_book_purchases_book_id ON book_purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_email ON book_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_book_purchases_status ON book_purchases(status);
CREATE INDEX IF NOT EXISTS idx_book_purchases_payment_id ON book_purchases(payment_intent_id);

-- ============================================
-- 6. VOICE COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voice_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  artist_name TEXT NOT NULL DEFAULT 'Joey Hendrickson',
  
  -- Audio data (stored as base64 or reference)
  audio_data TEXT NOT NULL, -- Base64 encoded audio
  audio_filename TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'purchased', 'sent')),
  purchase_session_id TEXT, -- Stripe session ID or PayPal order ID
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for voice comments
CREATE INDEX IF NOT EXISTS idx_voice_comments_song_id ON voice_comments(song_id);
CREATE INDEX IF NOT EXISTS idx_voice_comments_status ON voice_comments(status);
CREATE INDEX IF NOT EXISTS idx_voice_comments_purchase ON voice_comments(purchase_session_id) WHERE purchase_session_id IS NOT NULL;

-- ============================================
-- 7. PURCHASE TRANSACTIONS TABLE (Simplified)
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Purchase type
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('song', 'album', 'book', 'voice_comment')),
  
  -- References
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  
  -- Payment info
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal')),
  payment_intent_id TEXT NOT NULL, -- Stripe session ID or PayPal order ID
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Customer info
  customer_email TEXT,
  customer_name TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Metadata (JSON for flexible data)
  metadata JSONB DEFAULT '{}', -- Can store song IDs for albums, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for purchase transactions
CREATE INDEX IF NOT EXISTS idx_purchase_transactions_type ON purchase_transactions(purchase_type);
CREATE INDEX IF NOT EXISTS idx_purchase_transactions_payment_id ON purchase_transactions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_purchase_transactions_status ON purchase_transactions(status);
CREATE INDEX IF NOT EXISTS idx_purchase_transactions_created ON purchase_transactions(created_at DESC);

-- ============================================
-- 8. APPROVAL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('song', 'book')),
  item_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'removed')),
  
  -- Admin info
  admin_email TEXT,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Item details
  item_title TEXT,
  item_artist_name TEXT,
  notes TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for approval history
CREATE INDEX IF NOT EXISTS idx_approval_history_item ON approval_history(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_created ON approval_history(created_at DESC);

-- ============================================
-- 9. TOPICS TABLE (Website Pages for RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT UNIQUE NOT NULL, -- e.g., 'consultant', 'projects', 'founder'
  title TEXT NOT NULL,
  description TEXT,
  route TEXT NOT NULL, -- e.g., '/consultant'
  content TEXT NOT NULL, -- Main content/body text (Markdown supported)
  
  -- Structured data for RAG
  ontology JSONB DEFAULT '{}', -- Structured ontological data (sections, key points, etc.)
  metadata JSONB DEFAULT '{}', -- Additional metadata (key projects, achievements, etc.)
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for topics
CREATE INDEX IF NOT EXISTS idx_topics_topic_id ON topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_route ON topics(route);
CREATE INDEX IF NOT EXISTS idx_topics_active ON topics(is_active) WHERE is_active = true;

-- ============================================
-- 10. PERSONAL CONTENT TABLE (For RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS personal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'childhood',
    'high-school',
    'college',
    'invention-process',
    'travels',
    'dating',
    'faith',
    'marriage',
    'values',
    'hobbies',
    'gym-routine',
    'personal-stories'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for personal content
CREATE INDEX IF NOT EXISTS idx_personal_content_category ON personal_content(category);
CREATE INDEX IF NOT EXISTS idx_personal_content_published ON personal_content(is_published) WHERE is_published = true;

-- ============================================
-- 11. FOUNDER VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS founder_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  outlet TEXT DEFAULT 'NBC',
  youtube_id TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for founder videos
CREATE INDEX IF NOT EXISTS idx_founder_videos_year ON founder_videos(year DESC);
CREATE INDEX IF NOT EXISTS idx_founder_videos_created ON founder_videos(created_at DESC);

-- ============================================
-- 12. SPEAKER VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS speaker_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event TEXT NOT NULL,
  year INTEGER,
  role TEXT DEFAULT 'speaker' CHECK (role IN ('speaker', 'moderator', 'panelist', 'keynote')),
  description TEXT,
  event_page_url TEXT,
  youtube_id TEXT,
  location TEXT,
  topics TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for speaker videos
CREATE INDEX IF NOT EXISTS idx_speaker_videos_year ON speaker_videos(year DESC);
CREATE INDEX IF NOT EXISTS idx_speaker_videos_event ON speaker_videos(event);
CREATE INDEX IF NOT EXISTS idx_speaker_videos_created ON speaker_videos(created_at DESC);

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_videos ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read approved songs" ON songs
  FOR SELECT USING (status = 'approved' AND is_public = true);

CREATE POLICY "Public can read published books" ON books
  FOR SELECT USING (is_published = true AND is_available = true);

CREATE POLICY "Public can read active topics" ON topics
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read published personal content" ON personal_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read founder videos" ON founder_videos
  FOR SELECT USING (true);

CREATE POLICY "Public can read speaker videos" ON speaker_videos
  FOR SELECT USING (true);

-- Allow all operations on voice_comments (admin uses service role key)
CREATE POLICY "Allow all operations on voice_comments" ON voice_comments
  FOR ALL USING (true);

-- Allow all operations on approval_history (admin uses service role key)
CREATE POLICY "Allow all operations on approval_history" ON approval_history
  FOR ALL USING (true);

-- Allow all operations on purchase_transactions (admin uses service role key)
CREATE POLICY "Allow all operations on purchase_transactions" ON purchase_transactions
  FOR ALL USING (true);

-- Allow all operations on book_purchases (admin uses service role key)
CREATE POLICY "Allow all operations on book_purchases" ON book_purchases
  FOR ALL USING (true);

-- Admin users: Only admins can read (via service role key in API routes)
CREATE POLICY "Admin users are readable" ON admin_users
  FOR SELECT USING (true);

-- Users table: Public can read (for analytics)
CREATE POLICY "Public can read users" ON users
  FOR SELECT USING (true);

-- ============================================
-- 14. UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_purchases_updated_at
  BEFORE UPDATE ON book_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_comments_updated_at
  BEFORE UPDATE ON voice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_content_updated_at
  BEFORE UPDATE ON personal_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_videos_updated_at
  BEFORE UPDATE ON founder_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speaker_videos_updated_at
  BEFORE UPDATE ON speaker_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 15. INITIAL TOPICS DATA (For RAG/Search)
-- ============================================

INSERT INTO topics (topic_id, title, description, route, content, ontology, metadata, is_active)
VALUES
  ('consultant', 'Consultant', 'Digital consulting services, web and platform development, and AI solutions', '/consultant', 
   '# Consulting Services\n\nDigital Consulting: Complex project management for Fortune 100 companies, startups, and cities.\n\nWeb & Platform Development: Custom web applications and platforms.\n\nAI Solutions: Integrating AI into small business and enterprise functions to support growth, advancement, and team value.',
   '{"sections": ["Digital Consulting", "Web & Platform Development", "AI Solutions"], "keyPoints": ["Current focus: AI integration for business growth", "Areas of expertise: AI SaaS, Welding Robotics, IoT Surgical Robotics"]}',
   '{"keyProjects": ["Path Robotics", "InnateIQ", "Mayo Clinic", "JobsOhio"]}',
   true),
  ('projects', 'Projects', 'Portfolio of 14+ years of cross-functional IT management', '/projects',
   '# Projects Portfolio\n\nA comprehensive portfolio showcasing 14+ years of cross-functional IT management delivering enterprise solutions across multiple industries.',
   '{"sections": ["Total Project Value", "Project Categories", "Chronological Organization"], "categories": ["AI/ML", "Robotics", "Cloud", "SaaS", "IoT", "Blockchain", "ERP", "Civic", "Automation"]}',
   '{"totalProjects": 40, "totalValue": "$300M+"}',
   true),
  ('founder', 'Founder', 'Entrepreneurial ventures and press coverage', '/founder',
   '# Founder & Entrepreneur\n\nEntrepreneurial journey including press coverage, NBC interviews, and founder projects with investment and profitability tracking.',
   '{"sections": ["Press Coverage", "NBC Interviews", "Entrepreneurial Journey", "Founder Projects"]}',
   '{"pressMentions": ["Google", "YouTube with UNESCO Poland", "Jamaica Gleaner", "The Ohio State University", "Columbus Underground"]}',
   true),
  ('speaker', 'Speaker', 'Speaking engagements, panels, and keynotes', '/speaker',
   '# Speaker & Presenter\n\nSpeaking engagements at major events including SXSW, Techstars, Music Canada, and WOMEX from 2016-2022.',
   '{"sections": ["Speaking Events", "YouTube Videos", "Event Pages"], "events": ["SXSW", "Techstars", "Music Canada", "WOMEX"]}',
   '{"years": [2016, 2017, 2018, 2019, 2020, 2021, 2022]}',
   true),
  ('music', 'Music', 'Music streaming and downloads', '/music',
   '# Music\n\nMusic page with streaming, flip cards for listening, voice comments, and download functionality with PayPal and Stripe checkout.',
   '{"sections": ["Song Streaming", "Voice Comments", "Downloads", "Custom Albums"]}',
   '{"features": ["$3 per song", "$15 for 10-song album", "PayPal and Stripe checkout"]}',
   true),
  ('author', 'Author', 'Digital book sales with AI-personalized messaging', '/author',
   '# Author\n\nDigital books available for purchase with AI-generated personalized messaging controlled via admin dashboard.',
   '{"sections": ["Book Catalog", "Personalized Messaging", "Purchase"]}',
   '{"upcomingTitles": ["AI for Small Business", "The Entrepreneurial Musician", "Digital Transformation Playbook"]}',
   true),
  ('travel-santa-marta', 'Travel Santa Marta', 'Travel packages to Santa Marta, Colombia', '/travel-santa-marta',
   '# Travel Santa Marta\n\nTravel packages to Santa Marta, Colombia with Joey as guide. Includes resort, jungle, and beach experiences.',
   '{"sections": ["Packages", "Booking", "Excursions"], "packages": ["1 Week", "2 Week", "Family", "Premium", "Luxury Jungle"]}',
   '{"prices": {"1week": 2500, "2week": 3000, "family1week": 3000, "family2week": 3500, "premium": 4000, "luxury": 4000}}',
   true),
  ('personal-ai-os', 'Personal AI OS', 'Promotion for lifestacks.ai', '/personal-ai-os',
   '# Personal AI OS\n\nModern, interactive promotion of the Personal AI OS project, linking to lifestacks.ai.',
   '{"sections": ["Overview", "Vision", "Link to lifestacks.ai"]}',
   '{"link": "https://lifestacks.ai"}',
   true)
ON CONFLICT (topic_id) DO NOTHING;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Next steps:
-- 1. Set up Supabase Storage buckets:
--    - songs (for audio files and images)
--    - books (for book files and covers)
-- 2. Configure RLS policies as needed
-- 3. Set up environment variables in .env.local
-- 4. Test admin login and dashboard
-- ============================================

