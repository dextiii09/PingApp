import { User, UserRole, UserStatus, VerificationStatus } from './types';

export const PLACEHOLDER_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE5IDIxdi0yYTRgMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==";

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
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Retro gaming bar & arcade chain expanding to new cities. Looking for gaming influencers and lifestyle creators to host launch parties.',
    location: 'Austin, TX',
    industry: 'Entertainment',
    companySize: '10-50',
    website: 'pixelarcade.co',
    tags: ['Gaming', 'Events', 'Lifestyle', 'Retro'],
    stats: { budget: '₹3,000 - ₹10,000' },
    aiMatchScore: 88,
    aiMatchReason: 'Your gaming content has high overlap with their target demographic for the new Austin location.',
    portfolio: []
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'biz-1',
    name: 'Aura Wellness',
    email: 'partnerships@aurawellness.com',
    role: UserRole.BUSINESS,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Premium sustainable yoga wear looking for authentic storytellers in the wellness space. We value mindfulness and high-quality aesthetic content.',
    location: 'Los Angeles, CA',
    industry: 'Wellness & Apparel',
    companySize: '50-100',
    website: 'aurawellness.com',
    tags: ['Wellness', 'Yoga', 'Sustainability', 'Eco-Friendly'],
    stats: { budget: '₹5,000 - ₹15,000' },
    aiMatchScore: 98,
    aiMatchReason: 'Your high engagement in the fitness niche perfectly aligns with their new seasonal collection launch.',
    portfolio: [],
    pingScore: 95,
    completionRate: 100,
    responseTime: 'Under 1h'
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'biz-2',
    name: 'NextGen Tech',
    email: 'hello@nextgentech.ai',
    role: UserRole.BUSINESS,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Leading AI startup seeking tech reviewers and futurists to showcase our next-generation productivity suite. Looking for creative demo videos.',
    location: 'San Francisco, CA',
    industry: 'Software / AI',
    companySize: '10-50',
    website: 'nextgen.ai',
    tags: ['Tech', 'AI', 'Productivity', 'B2B'],
    stats: { budget: '₹10,000+' },
    aiMatchScore: 85,
    aiMatchReason: 'Their audience demographics overlap with your core tech-savvy followers.',
    portfolio: []
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'biz-3',
    name: 'Glow Skin',
    email: 'collabs@glowskin.co',
    role: UserRole.BUSINESS,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Organic skincare for the modern lifestyle. We are looking for creators who prioritize natural beauty and honest reviews.',
    location: 'London, UK',
    industry: 'Beauty & Cosmetics',
    companySize: '100-500',
    website: 'glowskin.co',
    tags: ['Skincare', 'Beauty', 'Organic', 'Self-Care'],
    stats: { budget: '₹2,000 - ₹8,000' },
    aiMatchScore: 72,
    aiMatchReason: 'While beauty isn\'t your primary niche, your lifestyle content shows a strong interest in wellness products.',
    portfolio: []
  }
];

export const MOCK_INFLUENCER_USERS: User[] = [
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'test-inf-1',
    name: 'Jamie Rivera',
    email: 'jamie.travels@social.com',
    role: UserRole.INFLUENCER,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Solo traveler documenting hidden gems and local eats. Content focused on budget travel and authentic experiences.',
    location: 'Nomad / Bali',
    jobTitle: 'Travel Vlogger',
    tags: ['Travel', 'Food', 'Adventure', 'Budget'],
    stats: { followers: '45k', engagement: '8.5%' },
    socials: { instagram: '@jamietravels', youtube: 'youtube.com/jamierivera' },
    aiMatchScore: 92,
    aiMatchReason: 'High engagement in the travel sector makes Jamie perfect for location-based campaigns.',
    portfolio: [],
    pingScore: 90,
    completionRate: 95,
    responseTime: 'Under 2h'
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'inf-1',
    name: 'Sarah Jensen',
    email: 'sarah.jensen@creators.com',
    role: UserRole.INFLUENCER,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Lifestyle & Wellness creator based in NYC. I share daily routines, healthy recipes, and aesthetic living tips. Helping brands reach Gen-Z naturally.',
    location: 'New York, NY',
    jobTitle: 'Lifestyle Creator',
    tags: ['Wellness', 'Aesthetic', 'Gen-Z', 'Lifestyle'],
    stats: { followers: '120k', engagement: '4.2%' },
    socials: { instagram: '@sarahliving', tiktok: '@sarahjensen', youtube: 'youtube.com/sarahjensen' },
    aiMatchScore: 94,
    aiMatchReason: 'Your brand values for Aura Wellness align 100% with Sarah\'s high-quality yoga content.',
    portfolio: []
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'inf-2',
    name: 'Marcus Chen',
    email: 'marcus@techreviews.com',
    role: UserRole.INFLUENCER,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Tech enthusiast and Software Engineer. I build apps and review the latest hardware. Focused on AI and futuristic gadgets.',
    location: 'San Francisco, CA',
    jobTitle: 'Tech Reviewer',
    tags: ['Tech', 'AI', 'Software', 'Gadgets'],
    stats: { followers: '540k', engagement: '3.1%' },
    socials: { twitter: '@marcustech', youtube: 'youtube.com/marcusreviews', linkedin: 'linkedin.com/in/marcuschen' },
    aiMatchScore: 88,
    aiMatchReason: 'Marcus has a highly conversion-driven audience for SaaS products like NextGen AI.',
    portfolio: []
  },
  {
    ...COMMON_ADMIN_FIELDS,
    id: 'inf-3',
    name: 'Alex Rivera',
    email: 'alex@fitness.fit',
    isPremium: false, // Non-premium for verification
    role: UserRole.INFLUENCER,
    avatar: PLACEHOLDER_AVATAR,
    bio: 'Certified personal trainer and hybrid athlete. Helping you build a body that looks good and performs better. No shortcuts, just hard work.',
    location: 'Miami, FL',
    jobTitle: 'Fitness Coach',
    tags: ['Fitness', 'Health', 'Athlete', 'Nutrition'],
    stats: { followers: '85k', engagement: '7.8%' },
    socials: { instagram: '@alexriverafit', tiktok: '@alexfit' },
    aiMatchScore: 79,
    aiMatchReason: 'Exceptional engagement rate. His audience trusts his product recommendations implicitly.',
    portfolio: []
  }
];