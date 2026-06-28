import { supabase } from '../supabase/client';
import type { Post } from '../types';

export async function fetchPosts(limit = 20): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchPostsByUser(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPost(post: { user_id: string; title: string; description: string }): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to create post');
  return data;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to update post');
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}
