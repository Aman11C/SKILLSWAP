-- SkillSwap Complete Database Schema
-- Run this entire file in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Or use: npx tsx setup-database.ts (with .env configured)

-- ============================================================
-- 001_create_tables.sql
-- ============================================================
-- Create profiles table. Real users use their auth.uid(); seeded demo profiles
-- are plain public profiles and do not need matching auth.users rows.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    avatar TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    college TEXT NOT NULL DEFAULT '',
    teach_skills TEXT[] NOT NULL DEFAULT '{}',
    learn_skills TEXT[] NOT NULL DEFAULT '{}',
    rating NUMERIC NOT NULL DEFAULT 0.0,
    matches_count INTEGER NOT NULL DEFAULT 0,
    location TEXT,
    contact_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    members_count INTEGER NOT NULL DEFAULT 1,
    max_members INTEGER NOT NULL DEFAULT 10,
    image_color TEXT NOT NULL DEFAULT 'from-[#eaff00] to-yellow-400',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_members join table
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (team_id, user_id)
);

-- Create connections table (handles match requests)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
    proposed_skill TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    target_skill TEXT,  -- Added in 005
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 002_enable_rls.sql
-- ============================================================
-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public select on profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow users to insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- TEAMS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public select on teams" ON public.teams
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow auth users to insert teams" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Allow creator to update teams" ON public.teams
    FOR UPDATE USING (auth.uid() = created_by);

-- TEAM_MEMBERS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public select on team_members" ON public.team_members
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow users to join teams" ON public.team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Allow users to leave teams" ON public.team_members
    FOR DELETE USING (auth.uid() = user_id);

-- CONNECTIONS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow users to view own connections" ON public.connections
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY IF NOT EXISTS "Allow users to initiate connections" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY IF NOT EXISTS "Allow users to update own connections" ON public.connections
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow users to view own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY IF NOT EXISTS "Allow users to send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow users to view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Allow users to update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 003_seed_profiles.sql
-- ============================================================
-- 1. Insert demo public profiles
INSERT INTO public.profiles (id, name, avatar, bio, college, teach_skills, learn_skills, rating, matches_count, location, contact_url)
VALUES
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Arpit Bhardwaj',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'Figma power-user, UI designer, and design system architect. Need help crafting slick micro-interactions or solid user journeys? Let''s talk!',
    'NSUT Delhi',
    ARRAY['Figma', 'UI Design', 'Mobile'],
    ARRAY['React', 'Rust', 'Web3'],
    5.0,
    24,
    'Delhi, IN',
    'mailto:arpit@skillswap.app'
  ),
  (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Meera Sen',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'Data Scientist & ML researcher. I have spent 3 years fine-tuning models and slicing datasets. Wanting to learn Web3 & Solidity for decentralized AI.',
    'BITS Pilani',
    ARRAY['Data Science', 'Python', 'Machine Learning'],
    ARRAY['Web3', 'Solidity', 'React'],
    4.8,
    18,
    'Rajasthan, IN',
    'mailto:meera@skillswap.app'
  ),
  (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'Chaitanya K.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'Ethical hacker and server hardening geek. I eat Linux security configurations for breakfast. Wanting to pick up mobile development and UI design.',
    'IIT Bombay',
    ARRAY['Cybersecurity', 'Golang', 'Rust'],
    ARRAY['Mobile', 'UI Design', 'Figma'],
    4.9,
    32,
    'Mumbai, IN',
    'mailto:chaitanya@skillswap.app'
  ),
  (
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'Riya Sharma',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'Android & iOS engineer. I specialize in Flutter and React Native. Need to learn web frameworks and public speaking for pitch competitions.',
    'DTU',
    ARRAY['Mobile', 'React', 'Figma'],
    ARRAY['Public Speaking', 'Rust', 'Golang'],
    4.7,
    11,
    'Delhi, IN',
    'mailto:riya@skillswap.app'
  ),
  (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    'Devashish Raj',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    'Backend scale developer. I build lightning-fast systems in Golang and Rust. Always looking to collaborate on high-frequency databases. Wanting to learn UI/UX design.',
    'IIIT Delhi',
    ARRAY['Rust', 'Golang', 'Python'],
    ARRAY['UI Design', 'Figma', 'Product Management'],
    5.0,
    29,
    'Delhi, IN',
    'mailto:devashish@skillswap.app'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert teams
INSERT INTO public.teams (id, name, description, category, skills_required, members_count, max_members, image_color, created_by)
VALUES
  (
    'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'EthDelhi Web3 Innovators',
    'Looking for a solid React front-end wizard and a Solidity contract auditor to build a decentralized skill-exchange protocol for the upcoming hackathon!',
    'Hackathon',
    ARRAY['Web3', 'Solidity', 'React'],
    2,
    4,
    'from-[#eaff00] to-yellow-400',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
  ),
  (
    '02c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Rust Systems Study Group',
    'Diving deep into async runtimes, compiler memory models, and zero-cost abstractions in Rust. Weekly code reviews and pair programming sessions.',
    'Study Group',
    ARRAY['Rust', 'Golang'],
    4,
    8,
    'from-blue-600 to-[#2563eb]',
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'
  ),
  (
    '13d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'Figma Neo-Brutalist Design Sprint',
    'We are creating a comprehensive, modular Neo-Brutalist component UI kit. Designing everything from scratch. Beginners welcome if you bring energy!',
    'Design Sprint',
    ARRAY['Figma', 'UI Design'],
    3,
    6,
    'from-pink-600 to-rose-400',
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Seed members for teams (including team creators)
INSERT INTO public.team_members (team_id, user_id)
VALUES
  ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('02c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'),
  ('13d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- ============================================================
-- 004_remove_profiles_auth_fk.sql
-- ============================================================
-- Demo profiles should not require matching auth.users rows.
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND confrelid = 'auth.users'::regclass
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- ============================================================
-- 005_additional_tables.sql
-- ============================================================
-- Create additional tables for SkillSwap: skills, posts, and reviews

-- 1. Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Add target_skill to connections table for complete swap request data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'target_skill'
    ) THEN
        ALTER TABLE public.connections ADD COLUMN target_skill TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Policies for skills
CREATE POLICY IF NOT EXISTS "Allow public read on skills" ON public.skills
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow auth users to insert skills" ON public.skills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Policies for posts
CREATE POLICY IF NOT EXISTS "Allow public read on posts" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow auth users to insert own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Allow users to delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Policies for reviews
CREATE POLICY IF NOT EXISTS "Allow public read on reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow auth users to write reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 8. Update connections policies to include target_skill (no change needed, just ensure they work)

-- 9. Seed popular skills
INSERT INTO public.skills (name, category) VALUES
    ('React', 'Frontend'),
    ('Figma', 'Design'),
    ('Rust', 'Systems'),
    ('Golang', 'Backend'),
    ('Cybersecurity', 'Security'),
    ('Web3', 'Blockchain'),
    ('Python', 'General'),
    ('Mobile', 'Mobile'),
    ('Data Science', 'Data'),
    ('UI Design', 'Design'),
    ('Machine Learning', 'Data'),
    ('Public Speaking', 'Soft Skills'),
    ('Solidity', 'Blockchain'),
    ('Product Management', 'Management')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES (run after to verify)
-- ============================================================
-- SELECT * FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;