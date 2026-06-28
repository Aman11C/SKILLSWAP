import { supabase } from '../supabase/client';

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  skills: string[];
  createdAt: string;
  profiles?: {
    name: string;
    avatar: string;
    college: string;
  };
}

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(name, avatar, college)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    content: p.content,
    skills: p.skills,
    createdAt: new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    profiles: p.profiles ? {
      name: p.profiles.name,
      avatar: p.profiles.avatar,
      college: p.profiles.college
    } : undefined
  }));
}

export async function createPost(post: {
  userId: string;
  title: string;
  content: string;
  skills: string[];
}): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: post.userId,
      title: post.title,
      content: post.content,
      skills: post.skills,
    })
    .select('*, profiles(name, avatar, college)')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    skills: data.skills,
    createdAt: new Date(data.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    profiles: data.profiles ? {
      name: data.profiles.name,
      avatar: data.profiles.avatar,
      college: data.profiles.college
    } : undefined
  };
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
