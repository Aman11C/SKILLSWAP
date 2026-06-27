-- 003_seed_profiles.sql
-- Seed demo profiles and teams into the database

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
