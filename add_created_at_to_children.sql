-- ============================================
-- ADD CREATED_AT TO CHILDREN
-- Run this in your Supabase SQL Editor
-- ============================================

ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
