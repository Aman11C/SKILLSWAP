export interface Profile {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  college: string;
  location: string | null;
  contact_url: string | null;
  teach_skills: string[];
  learn_skills: string[];
  rating: number;
  matches_count: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  type: 'teach' | 'learn';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SwapRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  proposed_skill: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthError {
  message: string;
  status?: number;
}