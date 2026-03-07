
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

export interface UserSettings {
  globalMode?: boolean;
  verifiedOnly?: boolean; // Phase 2: Show only verified profiles in Discovery
  maxDistance?: number;
  isVisible?: boolean;
  autoplay?: boolean;
  haptics?: boolean;
  onlineStatus?: boolean;
  readReceipts?: boolean;
  dataSaver?: boolean;
  language?: string;
  darkMode?: boolean;
  notifications?: {
    matches: boolean;
    messages: boolean;
    tips: boolean;
    email: boolean;
  };
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
  portfolio?: string[]; // Media Kit / Content Portfolio
  boostExpiresAt?: number; // Timestamp for Discovery Boost
  mediaKitVideoUrl?: string; // High-quality intro/portfolio video
  socialStats?: {
    instagramFollowers?: string;
    tiktokFollowers?: string;
    youtubeSubscribers?: string;
    avgEngagement?: string;
  };

  // Phase 3: Reputation & Trust & Monetization
  pingScore?: number; // 0-100 trust metric
  completionRate?: number; // % of contracts finished successfully
  responseTime?: string; // e.g. "Under 2h"
  totalEarnings?: number; // Total net earnings securely extracted from Escrow deals

  // Growth & Trust Phase Additions
  rating?: number; // Average star rating (1-5)
  reviewCount?: number; // Total number of reviews received

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

  settings?: UserSettings;

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
  type?: 'text' | 'proposal' | 'attachment' | 'contract'; // Support different message types
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'file';
  proposalId?: string; // Reference to a proposal document
  proposalData?: {
    title: string;
    price: string;
    deadline: string;
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  };
}

export interface Proposal {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  title: string;
  price: string;
  deadline: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  timestamp: number;
}

export interface Match {
  id: string;
  users: [string, string]; // IDs of the two users
  lastMessage?: string;
  lastSenderId?: string;
  lastActive: number;
  userProfile: User; // The profile of the OTHER person
  aiMatchReason?: string; // Phase 2: Personalized explanation from Gemini
}

export interface LiveBrief {
  id: string;
  brandId: string;
  brandName: string;
  brandAvatar: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  deadline: number; // Expiry timestamp (e.g. 24h)
  tags: string[];
  applicationsCount: number;
  timestamp: number;
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
    status: 'PAID' | 'PENDING' | 'LOCKED' | 'ESCROWED' | 'UNDER_REVIEW' | 'REVISION_REQUESTED';
    description?: string;
    contentUrl?: string; // Submitted work
    feedback?: string; // Brand notes
  }[];
  contractUrl?: string;
  isReviewed?: boolean; // Flag to prevent double-reviewing a contract
}

export interface Review {
  id: string;
  contractId: string;
  authorId: string;
  targetId: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: number;
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
  trends?: {
    dailyUsers: { date: string, count: number }[];
    dailyMatches: { date: string, count: number }[];
  };
}
