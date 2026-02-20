
import React, { useState, useEffect } from 'react';
import { User, UserRole, Match, Notification } from './types';
// Switch to real Firebase service
import { api } from './services/firebaseService';
import { Button } from './components/Button';
import { GlassCard } from './components/GlassCard';
import { SwipeDeck } from './components/SwipeDeck';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { EditProfile } from './components/EditProfile';
import { SettingsView } from './components/SettingsView';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { PremiumPage } from './components/PremiumPage';
import { NotificationsView } from './components/NotificationsView'; 
import { BottomNav } from './components/BottomNav';
import { APP_LOGO } from './constants';
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
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'app' | 'admin'>(() => {
    const saved = localStorage.getItem('ping_session_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode for new UI
  const [authError, setAuthError] = useState<string | null>(null);

  // Login Form State
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.INFLUENCER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Persistence Effect
  useEffect(() => {
    if (user) {
      localStorage.setItem('ping_session_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ping_session_user');
    }
  }, [user]);

  // Effects
  useEffect(() => {
    if (user && view === 'app') {
      refreshData();
    }
  }, [user, view]);

  // Sync Dark Mode with HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [cands, ms, notifs, likes] = await Promise.all([
        api.getCandidates(user.role),
        api.getMatches(),
        api.getNotifications(),
        api.getNewLikesCount()
      ]);
      setCandidates(cands);
      setMatches(ms);
      setNotifications(notifs);
      setLikeCount(likes);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      // Admin Check
      if (email === ADMIN_ID && password === ADMIN_PASS) {
        const adminUser = await api.login(UserRole.ADMIN, email, password); // Passing credentials for FB
        setUser(adminUser);
        setView('admin');
        setIsLoading(false);
        return;
      }

      let loggedUser;
      if (authMode === 'signup') {
         // name is optional in this UI flow, using email prefix as placeholder
         loggedUser = await api.signup(email, password, loginRole, email.split('@')[0]);
         // Go to onboarding after signup
         setUser(loggedUser);
         setView('onboarding');
      } else {
         loggedUser = await api.login(loginRole, email, password);
         setUser(loggedUser);
         setView('app');
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
      if (err.code === 'auth/wrong-password') msg = "Invalid password.";
      if (err.code === 'auth/user-not-found') msg = "User not found.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (type: 'business' | 'creator') => {
     if (type === 'business') {
        setEmail('hello@pixelarcade.co');
        setPassword('demo123');
        setLoginRole(UserRole.BUSINESS);
     } else {
        setEmail('jamie.travels@social.com');
        setPassword('demo123');
        setLoginRole(UserRole.INFLUENCER);
     }
     // Small timeout to allow state to set before "submitting" visually
     setTimeout(() => handleLogin(), 100);
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
    if (user) {
      // Update local state immediately for UI responsiveness
      const updated = { ...user, ...data };
      setUser(updated);
      
      // Persist to database
      try {
        await api.updateUserProfile(user.id, data);
        showToast("Profile Saved");
      } catch (e) {
        console.error("Failed to save profile", e);
        showToast("Error saving profile");
      }
    }
  };

  const handleMatchChat = async (matchedUser: User) => {
    if (!user) return;
    // In real firebase, this should be handled by api.swipe or api.addMatch
    // We'll call addMatch to ensure conversation exists
    const match = await api.addMatch(matchedUser);
    setSelectedMatch(match);
    refreshData();
  };

  // Views

  if (view === 'landing') {
    const isCreator = loginRole === UserRole.INFLUENCER;
    // Dynamic styles based on role
    const gradientText = isCreator 
      ? 'from-pink-500 to-orange-400' 
      : 'from-blue-600 to-indigo-500';
    const buttonGradient = isCreator
      ? 'bg-gradient-to-r from-pink-500 to-orange-400'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600';

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
      }
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
      <div className="min-h-[100dvh] w-full bg-[#fff5f7] relative overflow-hidden flex flex-col font-sans transition-colors duration-500">
        <div className="aurora-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center relative z-10 safe-top">
           <div className="flex items-center gap-2">
              <img src={APP_LOGO} alt="Ping Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20" />
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 tracking-tight">Ping</span>
           </div>
           
           {!showAuthForm && (
             <button 
               onClick={() => {
                  setAuthMode('signin');
                  setShowAuthForm(true);
                  setAuthError(null);
               }}
               className="flex items-center gap-2 text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors"
             >
                <Lock size={16} /> Log in
             </button>
           )}
        </div>

        {/* Spacer to push card to bottom */}
        <div className="flex-1" />

        {/* Bottom Card */}
        <div className="bg-white w-full rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-8 pb-12 relative z-10 animate-in slide-in-from-bottom duration-500">
           
           <AnimatePresence mode="wait">
             {!showAuthForm ? (
               <motion.div 
                 key="welcome"
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
                 exit="hidden"
               >
                 {/* Role Toggle */}
                 <motion.div variants={itemVariants as any} className="bg-gray-100 p-1.5 rounded-full flex mb-10 max-w-xs mx-auto shadow-inner">
                    <button 
                      onClick={() => setLoginRole(UserRole.INFLUENCER)}
                      className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${isCreator ? 'bg-white text-gray-900 shadow-md transform scale-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Creator
                    </button>
                    <button 
                      onClick={() => setLoginRole(UserRole.BUSINESS)}
                      className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${!isCreator ? 'bg-white text-gray-900 shadow-md transform scale-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Brand
                    </button>
                 </motion.div>

                 {/* Headlines */}
                 <motion.div variants={itemVariants as any} className="text-center space-y-6 mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                      {isCreator ? (
                        <>Monetize your <br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText}`}>Influence.</span></>
                      ) : (
                        <>Hire the world's <br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText}`}>Best Talent.</span></>
                      )}
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-xs mx-auto font-medium">
                      {isCreator 
                        ? "Connect with premium brands, manage deals, and get paid instantly."
                        : "Find creators that match your brand identity in seconds, not days."
                      }
                    </p>
                 </motion.div>

                 {/* CTA Button */}
                 <motion.div variants={itemVariants as any}>
                    <Button 
                       onClick={() => {
                          setAuthMode('signup');
                          setShowAuthForm(true);
                          setAuthError(null);
                       }}
                       fullWidth
                       className={`h-16 text-lg rounded-full shadow-xl shadow-pink-500/20 ${buttonGradient} border-none`}
                       style={{ transform: 'scale(1)' }} // Base for animation
                       animate={{ scale: [1, 1.02, 1] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                       Get Started <ArrowRight className="ml-2" />
                    </Button>
                 </motion.div>
               </motion.div>
             ) : (
               <motion.div 
                 key="form"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="pt-2"
               >
                  <div className="flex items-center mb-6">
                     <button onClick={() => setShowAuthForm(false)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <ChevronLeft size={24} />
                     </button>
                     <h2 className="text-2xl font-bold text-gray-900 ml-2">
                       {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                     </h2>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                      <AlertCircle size={14} />
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base"
                          placeholder="name@example.com"
                          required
                        />
                     </div>
                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                           {authMode === 'signin' && <button type="button" className="text-xs font-bold text-pink-500">Forgot?</button>}
                        </div>
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-base"
                          placeholder="••••••••"
                          required
                        />
                     </div>

                     <Button type="submit" fullWidth className={`h-16 text-lg rounded-full mt-2 shadow-xl shadow-pink-500/20 border-none ${buttonGradient}`}>
                        {isLoading ? (
                           <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</span>
                        ) : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                     </Button>

                     {/* DEMO LOGIN BUTTONS */}
                     {authMode === 'signin' && (
                       <div className="flex gap-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => handleDemoLogin('business')}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-3 rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-1"
                          >
                             <Briefcase size={12} /> Demo Brand
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDemoLogin('creator')}
                            className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold py-3 rounded-xl transition-colors border border-pink-200 flex items-center justify-center gap-1"
                          >
                             <Zap size={12} /> Demo Creator
                          </button>
                       </div>
                     )}

                     <div className="text-center pt-2">
                        <p className="text-sm text-gray-500 font-medium">
                          {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"} {' '}
                          <button 
                            type="button"
                            onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(null); }}
                            className="text-gray-900 font-bold hover:underline"
                          >
                            {authMode === 'signin' ? 'Sign up' : 'Log in'}
                          </button>
                        </p>
                     </div>
                  </form>
               </motion.div>
             )}
           </AnimatePresence>

           {!showAuthForm && (
             <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium">
                   Ping App by Reachup Media
                </p>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (view === 'admin') {
     return <AdminDashboard onLogout={handleLogout} />;
  }

  if (view === 'onboarding' && user) {
     return (
       <Onboarding 
         role={user.role} 
         onBack={handleLogout}
         onComplete={() => setView('app')} 
       />
     );
  }

  // APP VIEW
  if (!user) return null;

  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'dark bg-[#050505] text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
           <AnimatePresence mode="wait">
             {homeView === 'dashboard' ? (
                <Dashboard 
                  key="dashboard"
                  user={user}
                  notificationCount={notifications.filter(n => !n.read).length}
                  newLikesCount={likeCount}
                  onNavigate={(v) => {
                     if (v === 'deck') setHomeView('deck');
                     if (v === 'analytics') setHomeView('analytics');
                     // 'likes' not fully implemented separate view, stay on dashboard
                     if (v === 'likes') showToast("Feature coming soon!");
                     if (v === 'matches') setActiveTab('matches');
                     if (v === 'profile') setActiveTab('profile');
                  }}
                  onSettingsClick={() => setIsSettingsOpen(true)}
                  onNotificationsClick={() => setShowNotifications(true)}
                  onUpgrade={() => setShowPremium(true)}
                  onUpdateUser={handleUpdateUser}
                />
             ) : homeView === 'analytics' ? (
                <div key="analytics" className="h-full w-full relative">
                   {/* Analytics View Placeholder / Component */}
                   <div className="p-6">
                      <button onClick={() => setHomeView('dashboard')}>Back</button>
                      <h2>Analytics View</h2>
                   </div>
                </div>
             ) : (
                <div key="deck" className="h-full w-full relative">
                   <SwipeDeck 
                     candidates={candidates}
                     currentUserRole={user.role}
                     isPremium={user.isPremium}
                     onUpgrade={() => setShowPremium(true)}
                     onSwipe={async (dir, candidate) => {
                        // FIX: Ensure we pass ID string, handling if SwipeDeck passes object
                        const candidateId = typeof candidate === 'string' ? candidate : candidate.id;
                        const result = await api.swipe(user.id, candidateId, dir);
                        if (result.isMatch) {
                           refreshData(); // Refresh matches list
                        }
                     }}
                     onMatchChat={handleMatchChat}
                   />
                   <button 
                     onClick={() => setHomeView('dashboard')}
                     className="absolute top-4 left-4 z-50 p-2 bg-black/40 text-white rounded-full backdrop-blur-md border border-white/10"
                   >
                     Back
                   </button>
                </div>
             )}
           </AnimatePresence>
        )}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
           <div className="h-full w-full flex flex-col p-4 pt-10 overflow-y-auto pb-24">
              <h2 className="text-2xl font-bold mb-6 px-2">Matches & Messages</h2>
              {matches.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                    <p>No matches yet. Go swipe!</p>
                 </div>
              ) : (
                 <div className="space-y-2">
                    {matches.map(match => (
                       <GlassCard 
                         key={match.id} 
                         onClick={() => setSelectedMatch(match)}
                         className="flex items-center gap-4 p-4 cursor-pointer"
                         intensity="low"
                         hoverEffect={true}
                       >
                          <img src={match.userProfile.avatar} className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1">
                             <h3 className="font-bold text-sm">{match.userProfile.name}</h3>
                             <p className="text-xs text-white/50 truncate">{match.lastMessage || 'Start a conversation...'}</p>
                          </div>
                          <span className="text-[10px] text-white/30">Now</span>
                       </GlassCard>
                    ))}
                 </div>
              )}
           </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
           <EditProfile 
             user={user} 
             onSave={handleUpdateUser} 
             onCancel={() => setActiveTab('home')} 
           />
        )}
      </div>

      {/* Persistent Overlays */}
      <AnimatePresence>
         {isSettingsOpen && (
            <div className="fixed inset-0 z-[100] bg-black">
               <SettingsView 
                 onBack={() => setIsSettingsOpen(false)}
                 onLogout={handleLogout}
                 onUpgrade={() => setShowPremium(true)}
                 isDarkMode={isDarkMode}
                 onToggleTheme={() => setIsDarkMode(!isDarkMode)}
               />
            </div>
         )}

         {showNotifications && (
            <NotificationsView 
               notifications={notifications}
               onBack={() => setShowNotifications(false)}
            />
         )}

         {showPremium && (
            <PremiumPage 
               user={user}
               onClose={() => setShowPremium(false)}
               onUpgrade={async () => {
                  await api.upgradeToPremium();
                  handleUpdateUser({ isPremium: true });
                  setShowPremium(false);
                  showToast("Welcome to Gold!");
               }}
            />
         )}

         {selectedMatch && (
            <ChatInterface 
               match={selectedMatch}
               onBack={() => setSelectedMatch(null)}
               isPremium={user.isPremium}
               onUpgrade={() => setShowPremium(true)}
            />
         )}

         {toastMessage && (
            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
         )}
      </AnimatePresence>

      {/* Bottom Nav (Hidden if in certain views) */}
      {!selectedMatch && !isSettingsOpen && !showPremium && !showNotifications && (
         <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

    </div>
  );
};

export default App;
