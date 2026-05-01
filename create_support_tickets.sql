-- ============================================
-- FEATURE: Native Support Tickets
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('bug', 'feature')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 3. Users can only insert their own tickets
CREATE POLICY "Users can insert their own tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Users can only view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

-- 5. Create a secure Admin View to easily read all tickets from Supabase Table Editor
CREATE OR REPLACE VIEW public.admin_support_tickets AS
SELECT 
    t.id AS ticket_id,
    t.created_at,
    t.ticket_type,
    t.status,
    t.message,
    u.email AS user_email,
    p.first_name,
    p.last_name
FROM public.support_tickets t
JOIN auth.users u ON u.id = t.user_id
LEFT JOIN public.profiles p ON p.user_id = t.user_id
ORDER BY t.created_at DESC;

-- Revoke access from regular users to ensure absolute security for the view
REVOKE ALL ON public.admin_support_tickets FROM anon;
REVOKE ALL ON public.admin_support_tickets FROM authenticated;

-- Done!
