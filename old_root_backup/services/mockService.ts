
import { User, UserRole, Match, Message, AdminStats, UserStatus, VerificationStatus, Contract, Notification } from '../types';
import { MOCK_BUSINESS_USERS, MOCK_INFLUENCER_USERS, PLACEHOLDER_AVATAR } from '../constants';

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockService {
  private currentUser: User | null = null;
  private matches: Match[] = [];
  private notifications: Notification[] = [];
  
  async login(role: UserRole): Promise<User> {
    await delay(800);
    
    if (role === UserRole.ADMIN) {
      this.currentUser = {
        id: 'admin-001',
        name: 'System Admin',
        email: 'admin@ping.com',
        role: UserRole.ADMIN,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
        bio: 'God Mode Activated',
        location: 'Global',
        tags: ['Admin'],
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        joinedAt: Date.now(),
        reportCount: 0,
        isPremium: true
      };
      return this.currentUser;
    }

    // Check if we have an existing user to return, otherwise create a new session user
    const saved = localStorage.getItem('ping_session_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      return this.currentUser!;
    }

    this.currentUser = {
      id: `user-${Date.now()}`,
      name: 'Ping User', 
      email: 'user@ping.com',
      role: role,
      avatar: PLACEHOLDER_AVATAR,
      bio: 'New member of the Ping community. Ready to collaborate!',
      location: 'New York, NY',
      tags: ['New Member'],
      stats: role === UserRole.BUSINESS ? { budget: '$1,000' } : { followers: '0', engagement: '0%' },
      verified: false,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
      joinedAt: Date.now(),
      reportCount: 0,
      isPremium: false,
      socials: {
        instagram: '',
        tiktok: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        facebook: ''
      },
      portfolio: []
    };
    return this.currentUser;
  }

  async getCandidates(userRole: UserRole): Promise<User[]> {
    await delay(500);
    // If I am a business, show influencers. If I am an influencer, show businesses.
    const candidates = userRole === UserRole.BUSINESS ? MOCK_INFLUENCER_USERS : MOCK_BUSINESS_USERS;
    
    // Sort by AI Match Score if present
    return [...candidates].sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
  }

  async swipe(userId: string, candidateId: string, direction: 'left' | 'right' | 'up'): Promise<{ isMatch: boolean; match?: Match }> {
    await delay(600);
    // Standard logic: right or up is a match in this mock implementation
    return { isMatch: direction === 'right' || direction === 'up' };
  }

  async addMatch(profile: User): Promise<Match> {
    const existing = this.matches.find(m => m.userProfile.id === profile.id);
    if (existing) return existing;

    const newMatch: Match = {
      id: `match-${Date.now()}-${profile.id}`,
      users: [this.currentUser?.id || 'me', profile.id],
      lastActive: Date.now(),
      userProfile: profile,
      lastMessage: ''
    };
    this.matches.unshift(newMatch); // Most recent first
    return newMatch;
  }

  async getMatches(): Promise<Match[]> { 
    return [...this.matches]; 
  }

  async getNotifications(): Promise<Notification[]> { 
    return this.notifications; 
  }
  
  async getNewLikesCount(): Promise<number> {
    await delay(300);
    // Return a number representing new likes that haven't been seen yet
    // In a real app this would query the DB. Here we mock it.
    return 14;
  }
  
  async getMessages(matchId: string): Promise<Message[]> { 
    return []; 
  }
  
  async sendMessage(matchId: string, text: string): Promise<Message> {
    // Update match preview
    const match = this.matches.find(m => m.id === matchId);
    if (match) {
      match.lastMessage = text;
      match.lastActive = Date.now();
    }
    return { id: Math.random().toString(), senderId: 'me', text, timestamp: Date.now(), read: false };
  }

  async getContract(matchId: string): Promise<Contract | null> { 
    return null; 
  }

  async upgradeToPremium(): Promise<void> { 
    await delay(500); 
  }

  async getAdminStats(): Promise<AdminStats> {
    return { 
      totalUsers: 1240, 
      split: { business: 420, influencer: 820 }, 
      revenue: 15400, 
      activeMatches: 342, 
      pendingVerifications: 12 
    };
  }

  async getAllUsers(): Promise<User[]> { 
    return [...MOCK_BUSINESS_USERS, ...MOCK_INFLUENCER_USERS]; 
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    await delay(300);
  }

  async verifyUser(userId: string, isApproved: boolean): Promise<void> {
    await delay(300);
  }
}

export const api = new MockService();
