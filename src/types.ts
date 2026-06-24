export interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  college: string;
  teachSkills: string[];
  learnSkills: string[];
  rating: number;
  matchesCount: number;
  isUser?: boolean;
  location?: string;
  contactUrl?: string;
}

export interface MatchRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  proposedSkill: string;
  message: string;
  timestamp: string;
}

export interface Message {
  id: string;
  swapId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface StudyTeam {
  id: string;
  name: string;
  description: string;
  category: string;
  skillsRequired: string[];
  membersCount: number;
  maxMembers: number;
  joined: boolean;
  imageColor: string;
  createdBy: string;
}
