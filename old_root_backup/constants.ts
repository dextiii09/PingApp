
import { User, UserRole, UserStatus, VerificationStatus } from './types';

export const PLACEHOLDER_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200";

/**
 * Ping Logo: White "P" on a vibrant Blue-to-Pink gradient background.
 * Using Base64 encoded SVG for maximum compatibility and to prevent loading errors.
 */
export const APP_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlYzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjEyOCIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNzYgMTI4aDgwYzYxLjg2IDAgMTEyIDUwLjE0IDExMiAxMTJzLTUwLjE0IDExMi0xMTIgMTEyaC0zMnY5NmgtNDhWMTI4em00OCAxNzZoMzJjMzUuMzUgMCA2NC0yOC42NSA2NC02NHMtMjguNjUtNjQtNjQtNjRoLTMydjEyOHoiLz48L3N2Zz4=";

const COMMON_ADMIN_FIELDS = {
  status: UserStatus.ACTIVE,
  verificationStatus: VerificationStatus.VERIFIED,
  joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
  reportCount: 0,
  verified: true,
  isPremium: true
};

export const MOCK_BUSINESS_USERS: User[] = [
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'test-biz-1',
    name: 'Pixel Arcade',
    email: 'hello@pixelarcade.co',
    role: UserRole.BUSINESS,
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Retro gaming bar & arcade chain expanding to new cities. Looking for gaming influencers and lifestyle creators to host launch parties.',
    location: 'Austin, TX',
    industry: 'Entertainment',
    companySize: '10-50',
    website: 'pixelarcade.co',
    tags: ['Gaming', 'Events', 'Lifestyle', 'Retro'],
    stats: { budget: '$3,000 - $10,000' },
    aiMatchScore: 88,
    aiMatchReason: 'Your gaming content has high overlap with their target demographic for the new Austin location.',
    portfolio: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'biz-1',
    name: 'Aura Wellness',
    email: 'partnerships@aurawellness.com',
    role: UserRole.BUSINESS,
    avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Premium sustainable yoga wear looking for authentic storytellers in the wellness space. We value mindfulness and high-quality aesthetic content.',
    location: 'Los Angeles, CA',
    industry: 'Wellness & Apparel',
    companySize: '50-100',
    website: 'aurawellness.com',
    tags: ['Wellness', 'Yoga', 'Sustainability', 'Eco-Friendly'],
    stats: { budget: '$5,000 - $15,000' },
    aiMatchScore: 98,
    aiMatchReason: 'Your high engagement in the fitness niche perfectly aligns with their new seasonal collection launch.',
    portfolio: [
      'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1545208393-216671fe73f7?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'biz-2',
    name: 'NextGen Tech',
    email: 'hello@nextgentech.ai',
    role: UserRole.BUSINESS,
    avatar: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Leading AI startup seeking tech reviewers and futurists to showcase our next-generation productivity suite. Looking for creative demo videos.',
    location: 'San Francisco, CA',
    industry: 'Software / AI',
    companySize: '10-50',
    website: 'nextgen.ai',
    tags: ['Tech', 'AI', 'Productivity', 'B2B'],
    stats: { budget: '$10,000+' },
    aiMatchScore: 85,
    aiMatchReason: 'Their audience demographics overlap with your core tech-savvy followers.',
    portfolio: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'biz-3',
    name: 'Glow Skin',
    email: 'collabs@glowskin.co',
    role: UserRole.BUSINESS,
    avatar: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Organic skincare for the modern lifestyle. We are looking for creators who prioritize natural beauty and honest reviews.',
    location: 'London, UK',
    industry: 'Beauty & Cosmetics',
    companySize: '100-500',
    website: 'glowskin.co',
    tags: ['Skincare', 'Beauty', 'Organic', 'Self-Care'],
    stats: { budget: '$2,000 - $8,000' },
    aiMatchScore: 72,
    aiMatchReason: 'While beauty isn\'t your primary niche, your lifestyle content shows a strong interest in wellness products.',
    portfolio: [
      'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  }
];

export const MOCK_INFLUENCER_USERS: User[] = [
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'test-inf-1',
    name: 'Jamie Rivera',
    email: 'jamie.travels@social.com',
    role: UserRole.INFLUENCER,
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400&h=600',
    bio: 'Solo traveler documenting hidden gems and local eats. Content focused on budget travel and authentic experiences.',
    location: 'Nomad / Bali',
    jobTitle: 'Travel Vlogger',
    tags: ['Travel', 'Food', 'Adventure', 'Budget'],
    stats: { followers: '45k', engagement: '8.5%' },
    socials: { instagram: '@jamietravels', youtube: 'youtube.com/jamierivera' },
    aiMatchScore: 92,
    aiMatchReason: 'High engagement in the travel sector makes Jamie perfect for location-based campaigns.',
    portfolio: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'inf-1',
    name: 'Sarah Jensen',
    email: 'sarah.jensen@creators.com',
    role: UserRole.INFLUENCER,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=600',
    bio: 'Lifestyle & Wellness creator based in NYC. I share daily routines, healthy recipes, and aesthetic living tips. Helping brands reach Gen-Z naturally.',
    location: 'New York, NY',
    jobTitle: 'Lifestyle Creator',
    tags: ['Wellness', 'Aesthetic', 'Gen-Z', 'Lifestyle'],
    stats: { followers: '120k', engagement: '4.2%' },
    socials: { instagram: '@sarahliving', tiktok: '@sarahjensen', youtube: 'youtube.com/sarahjensen' },
    aiMatchScore: 94,
    aiMatchReason: 'Your brand values for Aura Wellness align 100% with Sarah\'s high-quality yoga content.',
    portfolio: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1552072805-2a9039d00e57?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'inf-2',
    name: 'Marcus Chen',
    email: 'marcus@techreviews.com',
    role: UserRole.INFLUENCER,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=600',
    bio: 'Tech enthusiast and Software Engineer. I build apps and review the latest hardware. Focused on AI and futuristic gadgets.',
    location: 'San Francisco, CA',
    jobTitle: 'Tech Reviewer',
    tags: ['Tech', 'AI', 'Software', 'Gadgets'],
    stats: { followers: '540k', engagement: '3.1%' },
    socials: { twitter: '@marcustech', youtube: 'youtube.com/marcusreviews', linkedin: 'linkedin.com/in/marcuschen' },
    aiMatchScore: 88,
    aiMatchReason: 'Marcus has a highly conversion-driven audience for SaaS products like NextGen AI.',
    portfolio: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1526738549149-8e07eca2c1b4?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'inf-3',
    name: 'Alex Rivera',
    email: 'alex@fitness.fit',
    role: UserRole.INFLUENCER,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=600',
    bio: 'Certified personal trainer and hybrid athlete. Helping you build a body that looks good and performs better. No shortcuts, just hard work.',
    location: 'Miami, FL',
    jobTitle: 'Fitness Coach',
    tags: ['Fitness', 'Health', 'Athlete', 'Nutrition'],
    stats: { followers: '85k', engagement: '7.8%' },
    socials: { instagram: '@alexriverafit', tiktok: '@alexfit' },
    aiMatchScore: 79,
    aiMatchReason: 'Exceptional engagement rate. His audience trusts his product recommendations implicitly.',
    portfolio: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?auto=format&fit=crop&q=80&w=400&h=400'
    ]
  }
];
