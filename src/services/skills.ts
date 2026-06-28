import { supabase } from '../supabase/client';
import type { Skill } from '../types';

export async function fetchSkillsByUser(userId: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addSkill(skill: { user_id: string; skill_name: string; type: 'teach' | 'learn' }): Promise<Skill> {
  const { data, error } = await supabase
    .from('skills')
    .insert(skill)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to add skill');
  return data;
}

export async function removeSkill(id: string): Promise<void> {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw error;
}

export async function clearUserSkills(userId: string, type: 'teach' | 'learn'): Promise<void> {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('user_id', userId)
    .eq('type', type);
  if (error) throw error;
}
