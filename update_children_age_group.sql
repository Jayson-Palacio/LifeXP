-- Run this script in your Supabase SQL Editor to add the new column without dropping the table
ALTER TABLE children ADD COLUMN IF NOT EXISTS age_group text DEFAULT 'all';
