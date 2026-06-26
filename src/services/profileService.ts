import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function mapProfileFromDB(dbProfile: any): Profile {
  return {
    id: dbProfile.id,
    name: dbProfile.name || '',
    avatar: dbProfile.avatar || '',
    bio: dbProfile.bio || '',
    college: dbProfile.college || '',
    teachSkills: dbProfile.teach_skills || [],
    learnSkills: dbProfile.learn_skills || [],
    rating: Number(dbProfile.rating || 0),
    matchesCount: Number(dbProfile.matches_count || 0),
    location: dbProfile.location || '',
    contactUrl: dbProfile.contact_url || '',
    isUser: false
  };
}

export function mapProfileToDB(profile: Profile) {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    college: profile.college,
    teach_skills: profile.teachSkills,
    learn_skills: profile.learnSkills,
    rating: profile.rating,
    matches_count: profile.matchesCount,
    location: profile.location,
    contact_url: profile.contactUrl
  };
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapProfileFromDB);
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfileFromDB(data) : null;
}

export async function upsertProfile(profile: Profile): Promise<Profile> {
  const dbRow = mapProfileToDB(profile);
  const { data, error } = await supabase
    .from('profiles')
    .upsert(dbRow)
    .select('*')
    .single();

  if (error) throw error;
  return mapProfileFromDB(data);
}

export async function ensureUserProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const defaultProfile = {
      id: userId,
      name: '',
      avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&auto=format&fit=crop&q=80',
      bio: '',
      college: '',
      teach_skills: [],
      learn_skills: [],
      rating: 0,
      matches_count: 0,
      location: '',
      contact_url: ''
    };

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(defaultProfile)
      .select('*')
      .single();

    if (insertError) throw insertError;
    return mapProfileFromDB(inserted);
  }

  return mapProfileFromDB(data);
}
