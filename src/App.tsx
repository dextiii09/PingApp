
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
import { LikesView } from './components/LikesView';
import { Onboarding } from './components/Onboarding';
import { PremiumPage } from './components/PremiumPage';
import { NotificationsView } from './components/NotificationsView';
import { BottomNav } from './components/BottomNav';
// Add PLACEHOLDER_AVATAR to imports from constants
import { APP_LOGO, PLACEHOLDER_AVATAR } from './constants';
import { Check, Mail, Lock, ArrowRight, Sparkles, Briefcase, Camera, Globe, TrendingUp, CheckCircle, ChevronLeft, AlertCircle, Zap, Search, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapApp } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [showAuthForm, setShowAuthForm] = useState(false);

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

  // Native Push Notification Registration
  useEffect(() => {
    if (user && user.id && view === 'app') {
      const registerPush = async () => {
        try {
          // Request permissions from the OS
          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            // Register with Apple/Google to receive token
            await PushNotifications.register();

            PushNotifications.addListener('registration', (token) => {
              console.log('Push registration success, token: ' + token.value);
              api.saveFcmToken(user.id, token.value);
            });

            PushNotifications.addListener('registrationError', (error: any) => {
              console.error('Push registration error: ', JSON.stringify(error));
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
              // Shown when app is open
              setToastMessage(notification.title || "New Notification");
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
              // Action when user taps on it from background
              setShowNotifications(true);
            });
          }
        } catch (e) {
          console.log("Push notifications not supported in this environment.", e);
        }
      };
      registerPush();

      return () => {
        PushNotifications.removeAllListeners();
      };
    }
  }, [user?.id, view]);  // Real-time Matches Subscription
  useEffect(() => {
    if (user && user.id && view === 'app') {
      const unsubscribe = api.subscribeToMatches(user.id, (updatedMatches) => {
        setMatches(updatedMatches);
      });
      return () => unsubscribe();
    }
  }, [user?.id, view]);



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
    if (v === 'likes') setHomeView('likes');
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
    // Automatically mark notifications as read when opening the panel
    if (setter === setShowNotifications) {
      api.markNotificationsAsRead().then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }).catch(console.error);
    }
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

    try {
      if (authMode === 'signup') {
        if (!verificationId) {
          // Send OTP
          if (!phoneNumber || phoneNumber.length < 10) throw new Error("Please enter a valid phone number with country code (e.g. +1234567890)");
          // Native call bypassing recaptcha-container
          const result = await api.sendOTP(phoneNumber);
          setVerificationId(result.verificationId);
        } else {
          // Verify OTP
          if (!otpCode || otpCode.length < 6) throw new Error("Please enter the 6-digit OTP code");
          const loggedUser = await api.verifyOTP(verificationId, otpCode, loginRole, "Ping User");
          setUser(loggedUser);
          setView('app');
          setVerificationId(null); // Reset
        }
      } else {
        // Normal Email Login
        const emailToUse = overrideEmail || email;
        const passToUse = overridePass || password;
        if (emailToUse === ADMIN_ID && passToUse === ADMIN_PASS) {
          const user = await api.login(UserRole.ADMIN, emailToUse, passToUse);
          setUser(user);
          setView(user.role === UserRole.ADMIN ? 'admin' : 'app');
        } else {
          const loggedUser = await api.login(loginRole, emailToUse, passToUse);
          setUser(loggedUser);
          setView('app');
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use. Try signing in.";
      if (err.code === 'auth/wrong-password') msg = "Invalid password.";
      if (err.code === 'auth/user-not-found') msg = "User not found.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid credentials.";
      if (err.code === 'auth/invalid-phone-number') msg = "Invalid phone number format. Include country code (e.g. +1).";
      if (err.code === 'auth/internal-error' && err.message.includes('recaptcha')) msg = "Recaptcha verification failed. Try again.";
      if (err.message) msg = err.message.replace('Firebase:', '');
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
                  {authMode === 'signup' ? (
                    verificationId ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-100 shadow-sm">
                          <CheckCircle className="text-pink-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Enter OTP Code</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto">
                          We've sent an SMS code to <br />
                          <span className="font-bold text-gray-900 text-base">{phoneNumber}</span>
                        </p>
                        <div className="space-y-1.5 pt-2">
                          <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} className="w-full text-center tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-bold text-xl" placeholder="123456" maxLength={6} required />
                        </div>
                        <Button type="submit" fullWidth className={`h-16 text-lg rounded-full mt-4 shadow-xl shadow-pink-500/20 border-none ${buttonGradient}`}>
                          {isLoading ? 'Verifying...' : 'Verify Code'}
                        </Button>
                        <Button type="button" onClick={() => setVerificationId(null)} variant="ghost" className="mt-2 text-pink-500 hover:bg-pink-50">
                          Use a different number
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Phone Number (with country code)</label>
                          <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base" placeholder="+1234567890" required />
                        </div>
                        <Button type="submit" fullWidth className={`h-16 text-lg rounded-full mt-2 shadow-xl shadow-pink-500/20 border-none ${buttonGradient}`}>
                          {isLoading ? 'Sending SMS...' : 'Send OTP Code'}
                        </Button>
                      </>
                    )
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base" placeholder="name@example.com" required />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                          <button type="button" className="text-xs font-bold text-pink-500">Forgot?</button>
                        </div>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base" placeholder="••••••••" required />
                      </div>
                      <Button type="submit" fullWidth className={`h-16 text-lg rounded-full mt-2 shadow-xl shadow-pink-500/20 border-none ${buttonGradient}`}>
                        {isLoading ? 'Processing...' : 'Sign In'}
                      </Button>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => handleDemoLogin('business')} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-3 rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-1"><Briefcase size={12} /> Demo Brand</button>
                        <button type="button" onClick={() => handleDemoLogin('creator')} className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold py-3 rounded-xl transition-colors border border-pink-200 flex items-center justify-center gap-1"><Zap size={12} /> Demo Creator</button>
                      </div>
                    </>
                  )}
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 font-medium">
                      {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"} {' '}
                      <button type="button" onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(null); setVerificationId(null); }} className="text-gray-900 font-bold hover:underline">
                        {authMode === 'signin' ? 'Sign up with Phone' : 'Log in with Email'}
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Invisible Recaptcha Container must live outside animated/conditional routing */}
          <div id="recaptcha-container"></div>
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
            ) : homeView === 'likes' ? (
              <LikesView
                key="likes"
                user={user}
                onBack={() => { setHomeView('dashboard'); refreshData(); }}
                onUpgrade={() => handleOpenOverlay(setShowPremium)}
                isDarkMode={isDarkMode}
              />
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
          <div className={`h-full w-full flex flex-col overflow-y-auto pb-32 transition-colors duration-300 ${isDarkMode ? 'bg-[#050505]' : 'bg-[#f8f9fa]'}`}>
            <div className={`px-6 pt-14 pb-6 sticky top-0 z-20 backdrop-blur-3xl ${isDarkMode ? 'bg-[#050505]/80' : 'bg-[#f8f9fa]/80'}`}>
              <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
              <div className={`mt-6 flex items-center px-4 py-3.5 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-gray-900'} transition-all`}>
                <Search size={20} className={isDarkMode ? 'text-white/40' : 'text-gray-400'} />
                <input
                  type="text"
                  placeholder="Search matches..."
                  className={`bg-transparent border-none outline-none w-full ml-3 text-sm font-semibold placeholder:text-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                />
              </div>
            </div>

            {matches.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 mt-4 animate-in fade-in zoom-in duration-500">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border border-white/10 shadow-black/50' : 'bg-white border border-pink-100 shadow-pink-500/10'}`}>
                  <MessageCircle size={48} className={isDarkMode ? 'text-white/20' : 'text-pink-300'} />
                </div>
                <h3 className={`text-2xl font-black mb-3 text-center tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No messages yet</h3>
                <p className={`text-center text-sm max-w-[280px] leading-relaxed font-bold mb-10 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  When you match with someone, you'll be able to send them a message here.
                </p>
                <Button onClick={() => { setActiveTab('home'); setHomeView('deck'); }} className="h-14 w-56 rounded-full shadow-2xl shadow-pink-500/20 bg-gradient-to-r from-pink-500 to-orange-400 border-none text-white text-lg font-bold">
                  Find Matches <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex-1 px-4 mt-2">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`}>Recent Conversations</h3>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>
                    {matches.length} Matches
                  </span>
                </div>

                <div className="space-y-4">
                  {matches.map(match => (
                    <div key={match.id} onClick={() => handleOpenMatch(match)} className={`flex items-center gap-4 p-4 cursor-pointer rounded-3xl transition-all duration-300 group ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-white border border-gray-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_-4px_rgba(236,72,153,0.15)] hover:border-pink-200'} relative overflow-hidden`}>
                      <div className="relative">
                        <img src={match.userProfile?.avatar || PLACEHOLDER_AVATAR} className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-transparent group-hover:ring-pink-500/10 transition-all duration-500" alt="" />
                        <div className={`absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 rounded-full ${isDarkMode ? 'border-[#121212]' : 'border-white'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex justify-between items-center mb-1.5">
                          <h3 className={`font-black text-lg truncate pr-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900 group-hover:text-pink-600 transition-colors'}`}>
                            {match.userProfile?.name || "Match"}
                          </h3>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                            {new Date(match.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-white/50' : 'text-gray-500 font-bold'}`}>
                          {match.lastSenderId === user.id ? "You: " : ""}
                          {match.lastMessage || 'Start a conversation...'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
