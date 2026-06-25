-- Add conjugations column to words table
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS conjugations JSONB;
