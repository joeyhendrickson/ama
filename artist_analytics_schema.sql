-- Artist Analytics System
-- Comprehensive tracking for artist page performance

-- Analytics events table
CREATE TABLE IF NOT EXISTS artist_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'pageview', 'vote', 'audio_play', 'audio_pause', 'time_spent', 'click'
  event_data jsonb DEFAULT '{}', -- Store additional event data
  user_agent text,
  ip_address text,
  session_id text, -- To track user sessions
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- User sessions table for tracking time spent
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  start_time timestamp with time zone DEFAULT timezone('utc'::text, now()),
  end_time timestamp with time zone,
  total_time_seconds integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Audio listening sessions
CREATE TABLE IF NOT EXISTS audio_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  start_time timestamp with time zone DEFAULT timezone('utc'::text, now()),
  end_time timestamp with time zone,
  duration_seconds integer DEFAULT 0,
  is_complete boolean DEFAULT false
);

-- Revenue tracking per artist
CREATE TABLE IF NOT EXISTS artist_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  total_revenue decimal(10,2) DEFAULT 0,
  total_payouts decimal(10,2) DEFAULT 0,
  pending_payouts decimal(10,2) DEFAULT 0,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artist_analytics_artist_id ON artist_analytics(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_analytics_event_type ON artist_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_artist_analytics_timestamp ON artist_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_sessions_artist_id ON user_sessions(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_artist_id ON audio_sessions(artist_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_song_id ON audio_sessions(song_id);

-- Function to update session time when user leaves
CREATE OR REPLACE FUNCTION update_session_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    NEW.total_time_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session time updates
DROP TRIGGER IF EXISTS session_time_trigger ON user_sessions;
CREATE TRIGGER session_time_trigger
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_time(); 