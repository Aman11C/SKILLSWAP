import { supabase } from '../supabase/client';

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export async function fetchAllSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchSkillsByCategory(category: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSkill(name: string, category: string = 'General'): Promise<Skill> {
  const { data, error } = await supabase
    .from('skills')
    .insert({ name, category })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function searchSkills(query: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data || [];
}