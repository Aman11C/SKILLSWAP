-- 005_additional_tables.sql
-- Create additional tables for SkillSwap: skills, posts, swap_requests, and reviews

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

-- 3. Create swap_requests table
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'declined')),
    proposed_skill TEXT NOT NULL,
    target_skill TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
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

-- 7. Policies for swap_requests
CREATE POLICY "Allow users to view own swap_requests" ON public.swap_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Allow users to initiate swap_requests" ON public.swap_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Allow users to update own swap_requests" ON public.swap_requests
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 8. Policies for reviews
CREATE POLICY "Allow public read on reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Allow auth users to write reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
