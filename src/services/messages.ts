import { supabase } from '../supabase/client';
import type { Message } from '../types';

export async function fetchMessages(userId: string, otherUserId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).filter(
    m => (m.sender_id === userId && m.receiver_id === otherUserId) ||
         (m.sender_id === otherUserId && m.receiver_id === userId)
  );
}

export async function sendMessage(msg: {
  sender_id: string;
  receiver_id: string;
  message: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(msg)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Failed to send message');
  return data;
}

export async function markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

export function subscribeToMessages(userId: string, callback: (message: Message) => void) {
  return supabase
    .channel('messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();
}
