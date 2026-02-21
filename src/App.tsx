
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { User, UserRole, Match, Notification } from './types';
// Switch to real Firebase service
import { api } from './services/firebaseService';
import { isConfigured } from './services/firebaseConfig';
import { Button } from './components/Button';
import { GlassCard } from './components/GlassCard';
import { SwipeDeck } from './components/SwipeDeck';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { EditProfile } from './components/EditProfile';
import { SettingsView } from './components/SettingsView';
import { Dashboard } from './components/Dashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { Onboarding } from './components/Onboarding';
import { PremiumPage } from './components/PremiumPage';
import { NotificationsView } from './components/NotificationsView';
import { BottomNav } from './components/BottomNav';
// Add PLACEHOLDER_AVATAR to imports from constants
import { APP_LOGO, PLACEHOLDER_AVATAR } from './constants';
import { Check, Mail, Lock, ArrowRight, Sparkles, Briefcase, Camera, Globe, TrendingUp, CheckCircle, ChevronLeft, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 border border-white/10"
    >
      <div className="bg-green-500 rounded-full p-1 text-black">
        <Check size={12} strokeWidth={4} />
      </div>
      <span className="text-sm font-semibold pr-1">{message}</span>
    </motion.div>
  );
};

// Admin Credentials
const ADMIN_ID = "admin@ping.com";
const ADMIN_PASS = "Ping$2024!Secure";

const App = () => {
  // App State with Persistence
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ping_session_user');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      // Immediately sync if valid to prevent data load errors
      if (parsed && parsed.id) api.syncSession(parsed);
      return parsed;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'app' | 'admin'>(() => {
    const saved = localStorage.getItem('ping_session_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (!u.id) return 'landing';
        return u.role === UserRole.ADMIN ? 'admin' : 'app';
      } catch {
        return 'landing';
      }
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'matches' | 'profile'>('home');
  const [homeView, setHomeView] = useState<'dashboard' | 'deck' | 'analytics' | 'likes'>('dashboard');

  // Data State
  const [candidates, setCandidates] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [likeCount, setLikeCount] = useState(0);

  // UI State
  const [isDeckLoading, setIsDeckLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(user?.settings?.darkMode ?? false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Swipe Limits & History
  const [dailySwipeCount, setDailySwipeCount] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<{ user: User; direction: 'left' | 'right' | 'up' }[]>([]);

  // Login Form State
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.INFLUENCER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Synchronous sync on render whenever user object changes
  useLayoutEffect(() => {
    if (user && user.id) {
      api.syncSession(user);
    }
  }, [user]);

  // Persistence Effect
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem('ping_session_user', JSON.stringify(user));
      // Sync Dark Mode from user settings if changed remotely
      if (user.settings?.darkMode !== undefined && user.settings.darkMode !== isDarkMode) {
        setIsDarkMode(user.settings.darkMode);
      }
    } else if (user === null) {
      localStorage.removeItem('ping_session_user');
    }
  }, [user]);

  // Sync Dark Mode with HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Magic Link Verification — runs once on load to complete passwordless sign-in
  useEffect(() => {
    const currentUrl = window.location.href;
    // Check if this page load came from clicking a magic link email
    if (currentUrl.includes('oobCode') || currentUrl.includes('apiKey')) {
      const savedEmail = localStorage.getItem('emailForSignIn');
      const savedRole = localStorage.getItem('pendingUserRole') as UserRole | null;
      if (savedEmail) {
        const doVerify = async () => {
          try {
            setIsLoading(true);
            const verifiedUser = await api.verifyMagicLink(
              savedEmail,
              currentUrl,
              savedRole || UserRole.INFLUENCER
            );
            setUser(verifiedUser);
            setView(verifiedUser.role === UserRole.ADMIN ? 'admin' : 'app');
            localStorage.removeItem('emailForSignIn');
            localStorage.removeItem('pendingUserRole');
          } catch (err: any) {
            console.error('Magic link verification failed:', err);
            setAuthError('Magic link sign-in failed. Please try again.');
            setView('login');
          } finally {
            setIsLoading(false);
          }
        };
        doVerify();
      }
    }
  }, []);

  // Real-time Matches Subscription
  useEffect(() => {
    if (user && user.id && view === 'app') {
      const unsubscribe = api.subscribeToMatches(user.id, (updatedMatches) => {
        setMatches(updatedMatches);
      });
      return () => unsubscribe();
    }
  }, [user?.id, view]);

  // Magic Link Verification Interceptor
  useEffect(() => {
    const checkEmailLink = async () => {
      // Safely check if the current window URL seems to be a Firebase Auth redirect
      if (window.location.href.includes('apiKey=') && window.location.href.includes('oobCode=')) {
        setIsLoading(true);
        try {
          let storedEmail = window.localStorage.getItem('emailForSignIn');
          if (!storedEmail) {
            storedEmail = window.prompt('Please provide your email for confirmation');
          }
          if (storedEmail) {
            const roleStr = (window.localStorage.getItem('pendingUserRole') as UserRole) || UserRole.INFLUENCER;
            // We use the email prefix as a placeholder name until they hit Onboarding
            const verifiedUser = await api.verifyMagicLink(storedEmail, window.location.href, roleStr, storedEmail.split('@')[0]);
            setUser(verifiedUser);

            if (verifiedUser.avatar === PLACEHOLDER_AVATAR && !verifiedUser.bio) {
              setView('onboarding');
            } else {
              setView('app');
            }

            // Scrub the one-time URL tokens so they don't refresh into an error
            window.history.replaceState({}, document.title, window.location.pathname);
            showToast("Successfully verified email!");
          }
        } catch (e: any) {
          console.error("Magic link verification failed:", e);
          setAuthError("Failed to verify confirmation link. It may have expired.");
          setView('landing');
          setShowAuthForm(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkEmailLink();
  }, []);

  const refreshData = useCallback(async () => {
    // Only attempt data load if we have a valid authenticated user
    if (!user || !user.id) {
      console.debug("Data load deferred: No authenticated user context.");
      return;
    }

    // Explicit sync before calling API to avoid race conditions
    api.syncSession(user);

    try {
      setIsDeckLoading(true);

      // Fetch data in parallel but handle individual failures gracefully
      const fetchResults = await Promise.allSettled([
        api.getCandidates(user.role),
        api.getNotifications(),
        api.getNewLikesCount(),
        api.getDailySwipeCount(user.id)
      ]);

      if (fetchResults[0].status === 'fulfilled') setCandidates(fetchResults[0].value);
      if (fetchResults[1].status === 'fulfilled') setNotifications(fetchResults[1].value);
      if (fetchResults[2].status === 'fulfilled') setLikeCount(fetchResults[2].value);
      if (fetchResults[3].status === 'fulfilled') setDailySwipeCount(fetchResults[3].value);

      // Log errors but don't crash
      fetchResults.forEach((res, i) => {
        if (res.status === 'rejected') {
          console.warn(`Non-critical load error (index ${i}):`, res.reason);
        }
      });

      console.debug("Application data refreshed (partial or full).");
    } catch (e: any) {
      console.error("Critical Data Load Error:", e);
      // Only set auth error for non-index errors or fatal ones
      if (!e.message?.includes('index') && user.id && !user.id.startsWith('test-') && view === 'app') {
        setAuthError(e.message || "Failed to load data. Please try again.");
      }
    } finally {
      setIsDeckLoading(false);
    }
  }, [user, view]);

  // Effects
  useEffect(() => {
    if (user && user.id && view === 'app') {
      refreshData();
    }
  }, [user?.id, view, refreshData]);

  // --- BACK BUTTON HANDLING ---

  const pushHistoryState = useCallback((stateName: string) => {
    window.history.pushState({ view: stateName }, '');
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (selectedMatch) {
        setSelectedMatch(null);
        return;
      }
      if (showPremium) {
        setShowPremium(false);
        return;
      }
      if (showNotifications) {
        setShowNotifications(false);
        return;
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }
      if (homeView !== 'dashboard') {
        setHomeView('dashboard');
        return;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return;
      }
    };

    window.history.replaceState({ view: 'root' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedMatch, showPremium, showNotifications, isSettingsOpen, homeView, activeTab]);

  const handleNavigate = (v: any) => {
    pushHistoryState(v);
    if (v === 'deck') setHomeView('deck');
    if (v === 'analytics') setHomeView('analytics');
    if (v === 'likes') showToast("Feature coming soon!");
    if (v === 'matches') setActiveTab('matches');
    if (v === 'profile') setActiveTab('profile');
  };

  const handleTabChange = (tab: 'home' | 'matches' | 'profile') => {
    pushHistoryState(tab);
    setActiveTab(tab);
    if (tab === 'home') setHomeView('dashboard');
  };

  const handleOpenOverlay = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    pushHistoryState('overlay');
    setter(true);
  };

  const handleOpenMatch = (match: Match) => {
    pushHistoryState('chat');
    setSelectedMatch(match);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string, overridePass?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const emailToUse = overrideEmail || email;
    const passToUse = overridePass || password;

    try {
      if (emailToUse === ADMIN_ID && passToUse === ADMIN_PASS) {
        const user = await api.login(UserRole.ADMIN, emailToUse, passToUse);
        setUser(user);
        setView(user.role === UserRole.ADMIN ? 'admin' : 'app');
        setIsLoading(false);
        return;
      }

      let loggedUser;
      if (authMode === 'signup') {
        localStorage.setItem('pendingUserRole', loginRole);
        // On Android file:// protocol, window.location.origin is 'null'
        // Always redirect to the Vercel web app for magic link completion
        const redirectUrl = (window.location.origin && window.location.origin !== 'null')
          ? window.location.origin
          : 'https://ping-app-five.vercel.app';
        await api.sendMagicLink(emailToUse, redirectUrl);
        setEmailSent(true);
      } else {
        loggedUser = await api.login(loginRole, emailToUse, passToUse);
        setUser(loggedUser);
        setView('app');
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use. Try signing in.";
      if (err.code === 'auth/wrong-password') msg = "Invalid password.";
      if (err.code === 'auth/user-not-found') msg = "User not found.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid credentials.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      if (err.message && !msg.includes('Email')) msg = err.message;
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (type: 'business' | 'creator') => {
    let dEmail = '';
    const dPass = 'demo123';
    if (type === 'business') {
      dEmail = 'hello@pixelarcade.co';
      setLoginRole(UserRole.BUSINESS);
    } else {
      dEmail = 'jamie.travels@social.com';
      setLoginRole(UserRole.INFLUENCER);
    }
    setEmail(dEmail);
    setPassword(dPass);
    handleLogin(undefined, dEmail, dPass);
  };

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem('ping_session_user');
    setUser(null);
    setView('landing');
    setEmail('');
    setPassword('');
    setShowAuthForm(false);
    setActiveTab('home');
    setHomeView('dashboard');
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    if (user && user.id) {
      const updated = { ...user, ...data };
      setUser(updated);
      try {
        await api.updateUserProfile(user.id, data);
        if (!data.settings) showToast("Profile Saved");
      } catch (e) {
        console.error("Failed to save profile", e);
        showToast("Error saving profile");
      }
    }
  };

  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (user) {
      handleUpdateUser({ settings: { ...(user.settings || {}), darkMode: nextMode } });
    }
  };

  const handleMatchChat = async (matchedUser: User) => {
    if (!user || !user.id) return;
    const match = await api.addMatch(matchedUser);
    handleOpenMatch(match);
    refreshData();
  };

  // Environment Variable Check UI
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-orange-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Missing</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Firebase environment variables are not detected. If you've just deployed to Vercel,
            make sure you added the keys from your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600">.env.local</code>
            to the Vercel Project Settings.
          </p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} fullWidth>Check Again</Button>
            <p className="text-xs text-gray-400">Environment: {import.meta.env.MODE}</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    const isCreator = loginRole === UserRole.INFLUENCER;
    const gradientText = isCreator ? 'from-pink-500 to-orange-400' : 'from-blue-600 to-indigo-500';
    const buttonGradient = isCreator ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600';
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

    return (
      <div className="min-h-[100dvh] w-full bg-[#fff5f7] relative overflow-hidden flex flex-col font-sans transition-colors duration-500">
        <div className="aurora-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="px-6 pt-8 pb-4 flex justify-between items-center relative z-10 safe-top">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="Ping Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20" />
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 tracking-tight">Ping</span>
          </div>
          {!showAuthForm && (
            <button onClick={() => { setAuthMode('signin'); setShowAuthForm(true); setAuthError(null); }} className="flex items-center gap-2 text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors">
              <Lock size={16} /> Log in
            </button>
          )}
        </div>
        <div className="flex-1" />
        <div className="bg-white w-full rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-8 pb-12 relative z-10 animate-in slide-in-from-bottom duration-500">
          <AnimatePresence mode="wait">
            {!showAuthForm ? (
              <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                <motion.div variants={itemVariants as any} className="bg-gray-100 p-1.5 rounded-full flex mb-10 max-w-xs mx-auto shadow-inner">
                  <button onClick={() => setLoginRole(UserRole.INFLUENCER)} className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${isCreator ? 'bg-white text-gray-900 shadow-md transform scale-100' : 'text-gray-400 hover:text-gray-600'}`}>Creator</button>
                  <button onClick={() => setLoginRole(UserRole.BUSINESS)} className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${!isCreator ? 'bg-white text-gray-900 shadow-md transform scale-100' : 'text-gray-400 hover:text-gray-600'}`}>Brand</button>
                </motion.div>
                <motion.div variants={itemVariants as any} className="text-center space-y-6 mb-10">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                    {isCreator ? (<>Monetize your <br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText}`}>Influence.</span></>) : (<>Hire the world's <br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText}`}>Best Talent.</span></>)}
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-xs mx-auto font-medium">
                    {isCreator ? "Connect with premium brands, manage deals, and get paid instantly." : "Find creators that match your brand identity in seconds, not days."}
                  </p>
                </motion.div>
                <motion.div variants={itemVariants as any}>
                  <Button onClick={() => { setAuthMode('signup'); setShowAuthForm(true); setAuthError(null); }} fullWidth className={`h-16 text-lg rounded-full shadow-xl shadow-pink-500/20 ${buttonGradient} border-none`} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>Get Started <ArrowRight className="ml-2" /></Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-2">
                <div className="flex items-center mb-6">
                  <button onClick={() => setShowAuthForm(false)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={24} /></button>
                  <h2 className="text-2xl font-bold text-gray-900 ml-2">{authMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
                </div>
                {authError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold"><AlertCircle size={14} />{authError}</div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                  {emailSent ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-100 shadow-sm">
                        <Mail className="text-pink-500" size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Check your email</h3>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto">
                        We've sent a magic login link to <br />
                        <span className="font-bold text-gray-900 text-base">{email}</span>
                      </p>
                      <Button type="button" onClick={() => setEmailSent(false)} variant="ghost" className="mt-4 text-pink-500 hover:bg-pink-50">
                        Try another email
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base" placeholder="name@example.com" required />
                      </div>
                      {authMode === 'signin' && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                            <button type="button" className="text-xs font-bold text-pink-500">Forgot?</button>
                          </div>
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base" placeholder="••••••••" required />
                        </div>
                      )}
                      <Button type="submit" fullWidth className={`h-16 text-lg rounded-full mt-2 shadow-xl shadow-pink-500/20 border-none ${buttonGradient}`}>
                        {isLoading ? (
                          <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                        ) : (
                          authMode === 'signin' ? 'Sign In' : 'Send Magic Link'
                        )}
                      </Button>
                      {authMode === 'signin' && (
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => handleDemoLogin('business')} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-3 rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-1"><Briefcase size={12} /> Demo Brand</button>
                          <button type="button" onClick={() => handleDemoLogin('creator')} className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold py-3 rounded-xl transition-colors border border-pink-200 flex items-center justify-center gap-1"><Zap size={12} /> Demo Creator</button>
                        </div>
                      )}
                      <div className="text-center pt-2">
                        <p className="text-sm text-gray-500 font-medium">
                          {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"} {' '}
                          <button type="button" onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(null); setEmailSent(false); }} className="text-gray-900 font-bold hover:underline">
                            {authMode === 'signin' ? 'Sign up' : 'Log in'}
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          {!showAuthForm && (<div className="mt-8 text-center"><p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium">Ping App by Reachup Media</p></div>)}
        </div>
      </div>
    );
  }

  if (view === 'admin') return <AdminDashboard onLogout={handleLogout} />;
  if (view === 'onboarding' && user) return <Onboarding role={user.role} onBack={handleLogout} onComplete={() => setView('app')} />;
  if (!user || !user.id) return null;

  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'dark bg-[#050505] text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'home' && (
          <AnimatePresence mode="wait">
            {homeView === 'dashboard' ? (
              <Dashboard key="dashboard" user={user} notificationCount={notifications.filter(n => !n.read).length} newLikesCount={likeCount} onNavigate={handleNavigate} onSettingsClick={() => handleOpenOverlay(setIsSettingsOpen)} onNotificationsClick={() => handleOpenOverlay(setShowNotifications)} onUpgrade={() => handleOpenOverlay(setShowPremium)} onUpdateUser={handleUpdateUser} />
            ) : homeView === 'analytics' ? (
              <AnalyticsView key="analytics" user={user} onBack={() => setHomeView('dashboard')} onUpgrade={() => handleOpenOverlay(setShowPremium)} />
            ) : (
              <div key="deck" className="h-full w-full relative">
                <SwipeDeck
                  isLoading={isDeckLoading}
                  candidates={candidates}
                  currentUserRole={user.role}
                  isPremium={user.isPremium}
                  dailySwipeCount={dailySwipeCount}
                  onSwipeCountChange={setDailySwipeCount}
                  swipeHistory={swipeHistory}
                  onSwipeHistoryChange={setSwipeHistory}
                  onUpgrade={() => handleOpenOverlay(setShowPremium)}
                  onSwipe={async (dir, candidateId) => {
                    try {
                      const result = await api.swipe(user.id, candidateId, dir);
                      if (result.isMatch) await refreshData();
                      return result;
                    } catch (err: any) {
                      // Log but don't block the UI if it's just a missing index
                      console.error("Swipe operation failed:", err);
                      return { isMatch: false };
                    }
                  }}
                  onMatchChat={handleMatchChat}
                />
                <button onClick={() => setHomeView('dashboard')} className="absolute top-4 left-4 z-[70] w-10 h-10 flex items-center justify-center bg-white/10 text-white rounded-full backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all shadow-lg hover:shadow-xl">
                  <ChevronLeft size={24} />
                </button>
              </div>
            )}
          </AnimatePresence>
        )}
        {activeTab === 'matches' && (
          <div className="h-full w-full flex flex-col p-4 pt-10 overflow-y-auto pb-32">
            <h2 className="text-2xl font-bold mb-6 px-2">Matches & Messages</h2>
            {matches.length === 0 ? (<div className="flex-1 flex flex-col items-center justify-center text-white/30"><p>No matches yet. Go swipe!</p></div>) : (
              <div className="space-y-2">
                {matches.map(match => (
                  <GlassCard key={match.id} onClick={() => handleOpenMatch(match)} className="flex items-center gap-4 p-4 cursor-pointer" intensity="low" hoverEffect={true}>
                    <img src={match.userProfile?.avatar || PLACEHOLDER_AVATAR} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{match.userProfile?.name || "Match"}</h3>
                      <p className="text-xs text-white/50 truncate">
                        {match.lastSenderId === user.id ? "You: " : ""}
                        {match.lastMessage || 'Start a conversation...'}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/30">
                      {new Date(match.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'profile' && <EditProfile user={user} onSave={handleUpdateUser} onCancel={() => handleTabChange('home')} />}
      </div>
      <AnimatePresence>
        {isSettingsOpen && (<div className="fixed inset-0 z-[100] bg-black"><SettingsView user={user} onUpdateUser={handleUpdateUser} onBack={() => setIsSettingsOpen(false)} onLogout={handleLogout} onUpgrade={() => handleOpenOverlay(setShowPremium)} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} /></div>)}
        {showNotifications && <NotificationsView notifications={notifications} onBack={() => setShowNotifications(false)} />}
        {showPremium && <PremiumPage user={user} onClose={() => setShowPremium(false)} onUpgrade={async () => { await api.upgradeToPremium(); handleUpdateUser({ isPremium: true }); setShowPremium(false); showToast("Welcome to Gold!"); }} />}
        {selectedMatch && <ChatInterface match={selectedMatch} currentUser={user} onBack={() => setSelectedMatch(null)} isPremium={user.isPremium} onUpgrade={() => handleOpenOverlay(setShowPremium)} />}
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>
      {!selectedMatch && !isSettingsOpen && !showPremium && !showNotifications && (activeTab !== 'home' || homeView === 'dashboard') && (<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />)}
    </div>
  );
};

export default App;
