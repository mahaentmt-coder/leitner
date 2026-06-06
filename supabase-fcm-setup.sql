-- Run this in your Supabase SQL editor to add FCM (Android push) support

CREATE TABLE IF NOT EXISTS fcm_tokens (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  fcm_token  TEXT NOT NULL,
  reminder_hour INTEGER DEFAULT 8,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow the service role (used by Vercel API) full access
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON fcm_tokens
  USING (true)
  WITH CHECK (true);
