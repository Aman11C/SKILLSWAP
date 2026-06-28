import { supabase } from '../supabase/client';
import type { Profile } from '../types';

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to save profile');
  return data;
}

export async function createProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to create profile');
  return data;
}
