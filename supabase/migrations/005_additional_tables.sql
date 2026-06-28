-- 005_additional_tables.sql
-- Create additional tables for SkillSwap: skills, posts, and reviews
-- swap_requests removed - using connections table from 001 instead

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
CREATE POLICY "Allow public read on skills" ON public.skills
    FOR SELECT USING (true);

CREATE POLICY "Allow auth users to insert skills" ON public.skills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Policies for posts
CREATE POLICY "Allow public read on posts" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Allow auth users to insert own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Policies for reviews
CREATE POLICY "Allow public read on reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Allow auth users to write reviews" ON public.reviews
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