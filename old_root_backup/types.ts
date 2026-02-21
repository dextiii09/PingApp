
export enum UserRole {
  BUSINESS = 'BUSINESS',
  INFLUENCER = 'INFLUENCER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  SHADOW_BANNED = 'SHADOW_BANNED'
}

export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  UNVERIFIED = 'UNVERIFIED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  location?: string;
  stats?: {
    followers?: string;
    engagement?: string;
    budget?: string;
  };
  tags: string[];
  verified?: boolean; // Legacy simple boolean, mapped to VerificationStatus in logic
  isPremium?: boolean; // Feature Flag for Premium features like AI Insights
  
  // New Features
  aiMatchScore?: number;
  aiMatchReason?: string;
  introVideoUrl?: string;
  voiceIntroUrl?: string; // Audio Intro
  portfolio?: string[]; // Media Kit / Content Portfolio

  // Extended Profile Details
  jobTitle?: string;
  company?: string;
  school?: string; // For Influencers
  industry?: string; // For Business
  companySize?: string; // For Business
  website?: string;
  socials?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    facebook?: string;
    other?: string;
  };

  // Admin Fields
  status: UserStatus;
  verificationStatus: VerificationStatus;
  joinedAt: number;
  reportCount: number;
  docUrl?: string; // For business verification
}

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'system' | 'tip';
  title: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
  type?: 'text' | 'proposal'; // Support different message types
  proposalData?: {
    title: string;
    price: string;
    deadline: string;
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  };
}

export interface Match {
  id: string;
  users: [string, string]; // IDs of the two users
  lastMessage?: string;
  lastActive: number;
  userProfile: User; // The profile of the OTHER person
}

export interface Contract {
  id: string;
  title: string;
  totalAmount: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  milestones: {
    id: string;
    title: string;
    amount: number;
    status: 'PAID' | 'PENDING' | 'LOCKED';
  }[];
}

export enum SwipeDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP'
}

export interface AdminStats {
  totalUsers: number;
  split: { business: number; influencer: number };
  revenue: number;
  activeMatches: number;
  pendingVerifications: number;
}
