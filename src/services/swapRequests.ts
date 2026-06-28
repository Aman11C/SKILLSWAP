import { supabase } from '../supabase/client';
import type { SwapRequest } from '../types';

export async function fetchSwapRequestsForUser(userId: string): Promise<SwapRequest[]> {
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSwapRequest(req: {
  sender_id: string;
  receiver_id: string;
  proposed_skill: string;
  message: string;
}): Promise<SwapRequest> {
  const { data, error } = await supabase
    .from('swap_requests')
    .insert({ ...req, status: 'pending' })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to create swap request');
  return data;
}

export async function updateSwapRequestStatus(id: string, status: 'accepted' | 'declined'): Promise<SwapRequest> {
  const { data, error } = await supabase
    .from('swap_requests')
    .update({ status })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to update swap request');
  return data;
}
