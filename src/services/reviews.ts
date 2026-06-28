import { supabase } from '../supabase/client';
import type { Review } from '../types';

export async function fetchReviewsForUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createReview(review: {
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to create review');
  return data;
}
