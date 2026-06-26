import { supabase } from '../lib/supabase';
import { MatchRequest, Message } from '../types';

export function mapConnectionFromDB(dbConn: any): MatchRequest {
  return {
    id: dbConn.id,
    senderId: dbConn.sender_id,
    receiverId: dbConn.receiver_id,
    status: dbConn.status as 'pending' | 'accepted' | 'declined',
    proposedSkill: dbConn.proposed_skill,
    message: dbConn.message || '',
    timestamp: new Date(dbConn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export function mapMessageFromDB(dbMsg: any, currentUserId: string): Message {
  return {
    id: dbMsg.id,
    senderId: dbMsg.sender_id,
    swapId: dbMsg.sender_id === currentUserId ? dbMsg.receiver_id : dbMsg.sender_id,
    text: dbMsg.text,
    timestamp: new Date(dbMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export async function fetchConnectionsForUser(userId: string): Promise<MatchRequest[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapConnectionFromDB);
}

export async function createConnection(conn: {
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  proposedSkill: string;
  message: string;
}): Promise<MatchRequest> {
  const { data, error } = await supabase
    .from('connections')
    .insert({
      sender_id: conn.senderId,
      receiver_id: conn.receiverId,
      status: conn.status,
      proposed_skill: conn.proposedSkill,
      message: conn.message
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapConnectionFromDB(data);
}

export async function updateConnectionStatus(id: string, status: 'pending' | 'accepted' | 'declined'): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function fetchMessagesForUser(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(dbMsg => mapMessageFromDB(dbMsg, userId));
}

export async function sendMessage(msg: { senderId: string; receiverId: string; text: string }): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: msg.senderId,
      receiver_id: msg.receiverId,
      text: msg.text
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapMessageFromDB(data, msg.senderId);
}
