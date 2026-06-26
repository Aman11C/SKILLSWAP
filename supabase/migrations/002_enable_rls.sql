-- 002_enable_rls.sql
-- Enable Row Level Security and add policies

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);


-- TEAMS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on teams" ON public.teams
    FOR SELECT USING (true);

CREATE POLICY "Allow auth users to insert teams" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow creator to update teams" ON public.teams
    FOR UPDATE USING (auth.uid() = created_by);


-- TEAM_MEMBERS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on team_members" ON public.team_members
    FOR SELECT USING (true);

CREATE POLICY "Allow users to join teams" ON public.team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to leave teams" ON public.team_members
    FOR DELETE USING (auth.uid() = user_id);


-- CONNECTIONS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own connections" ON public.connections
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Allow users to initiate connections" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Allow users to update own connections" ON public.connections
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);


-- MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Allow users to send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);
