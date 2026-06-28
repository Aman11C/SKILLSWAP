import { supabase } from '../supabase/client';

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewerName?: string;
  reviewerAvatar?: string;
}

export function mapReviewFromDB(dbReview: any): Review {
  return {
    id: dbReview.id,
    reviewerId: dbReview.reviewer_id,
    revieweeId: dbReview.reviewee_id,
    rating: Number(dbReview.rating),
    comment: dbReview.comment || '',
    created_at: dbReview.created_at,
    reviewerName: dbReview.profiles?.name,
    reviewerAvatar: dbReview.profiles?.avatar
  };
}

export async function fetchReviewsForUser(revieweeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles!reviews_reviewer_id_fkey (name, avatar)
    `)
    .eq('reviewee_id', revieweeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapReviewFromDB);
}

export async function createReview(review: {
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: review.reviewerId,
      reviewee_id: review.revieweeId,
      rating: review.rating,
      comment: review.comment
    })
    .select(`
      *,
      profiles!reviews_reviewer_id_fkey (name, avatar)
    `)
    .single();

  if (error) throw error;
  return mapReviewFromDB(data);
}

export async function fetchUserReviewForConnection(reviewerId: string, revieweeId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', reviewerId)
    .eq('reviewee_id', revieweeId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapReviewFromDB(data) : null;
}