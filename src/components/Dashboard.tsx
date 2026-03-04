import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { GlassCard } from './GlassCard';
import { Heart, Search, Zap, TrendingUp, LayoutGrid, Crown, ShieldCheck, ChevronRight, Briefcase, Settings, Clock } from 'lucide-react';
import { api } from '../services/firebaseService';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
   user: User;
   onNavigate: (view: string) => void;
   onUpgrade: () => void;
   onSettingsClick: () => void;
   onNotificationsClick: () => void;
   notificationCount: number;
   newLikesCount: number;
   onUpdateUser: (data: Partial<User>) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
   user,
   onNavigate,
   onUpgrade,
   onSettingsClick,
   onNotificationsClick,
   notificationCount,
   newLikesCount,
   onUpdateUser
}) => {
   const [isBoosting, setIsBoosting] = useState(false);

   const handleBoost = async () => {
      if (isBoosting || !user.isPremium) return;

      try {
         setIsBoosting(true);
         await api.activateBoost();

         confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fbbf24', '#ffffff']
         });

         // Trigger user update to refresh the dashboard
         await onUpdateUser({ boostExpiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      } catch (err) {
         console.error("Boost failed:", err);
      } finally {
         setIsBoosting(false);
      }
   };

   const boostTimeRemaining = user.boostExpiresAt ? user.boostExpiresAt - Date.now() : 0;
   const isBoostActive = boostTimeRemaining > 0;

   const formatTime = (ms: number) => {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${mins}m`;
   };

   // Calculate Real Profile Score based on completeness
   const criteria = [
      { met: !!user.name?.trim(), weight: 10 },
      { met: user.avatar && !user.avatar.includes('placeholder') && !user.avatar.includes('ui-avatars'), weight: 15 },
      { met: (user.bio?.length || 0) > 20, weight: 20 },
      { met: user.tags?.length > 0, weight: 10 },
      { met: !!user.introVideoUrl, weight: 35 },
      { met: Object.values(user.socials || {}).some((v: any) => !!v), weight: 10 },
   ];
   const profilePercentage = criteria.reduce((acc, c) => acc + (c.met ? c.weight : 0), 0);

   return (
      <div className="flex flex-col h-full bg-white dark:bg-black overflow-y-auto no-scrollbar pb-32">
         {/* Header Profile Section */}
         <div className="px-6 pt-12 pb-6 space-y-6">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                     Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">{user.name.split(' ')[0]}</span>
                  </h1>
                  <p className="text-gray-500 dark:text-white/40 text-sm font-medium">Ready for your next collaboration?</p>
               </div>
               <div className="flex items-center gap-3">
                  <button
                     onClick={onNotificationsClick}
                     className="relative p-2.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                     <Zap size={20} />
                     {notificationCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                     )}
                  </button>
                  <button
                     onClick={onSettingsClick}
                     className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                     <Settings size={20} />
                  </button>
                  <div className="relative group cursor-pointer" onClick={() => onNavigate('profile')}>
                     <div className="absolute -inset-1 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                     <img
                        src={user.avatar}
                        alt="Profile"
                        className="relative w-14 h-14 rounded-full border-2 border-white dark:border-black object-cover"
                     />
                     {user.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 border-2 border-white dark:border-black rounded-full p-1 shadow-lg">
                           <ShieldCheck size={12} className="text-white" />
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Action Card: Start Swiping */}
            <div
               onClick={() => onNavigate('deck')}
               className="relative h-48 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-pink-500/20"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-orange-400 group-hover:scale-105 transition-transform duration-700"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

               {/* Abstract Decorative Shapes */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-white/30 transition-colors"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>

               <div className="relative h-full p-8 flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-500">
                     <Zap size={24} fill="currentColor" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">Start Matching</h2>
                  <p className="text-white/70 font-medium flex items-center gap-2">
                     Find your next collab <ChevronRight size={16} />
                  </p>
               </div>
            </div>

            {/* Bento Grid Stats */}
            <div>
               <h3 className="text-sm font-bold text-gray-500 dark:text-white/40 mb-4 px-1 uppercase tracking-widest">Overview</h3>
               <div className="grid grid-cols-2 gap-4">
                  <GlassCard
                     className="p-5 flex flex-col justify-between h-40 group hover:border-pink-500/30 transition-colors bg-gray-50 dark:bg-white/5"
                     hoverEffect
                     onClick={() => onNavigate('likes')}
                  >
                     <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                        <Heart size={20} fill="currentColor" />
                     </div>
                     <div>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white block tracking-tight">{newLikesCount}</span>
                        <span className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-wider">New Likes</span>
                     </div>
                  </GlassCard>

                  {/* Ping Reputation Card */}
                  <GlassCard
                     className="p-5 flex flex-col justify-between h-40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 cursor-pointer"
                     hoverEffect
                     onClick={() => onNavigate('analytics')}
                  >
                     <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                           <ShieldCheck size={20} />
                        </div>
                        <div className="text-right">
                           <span className="text-lg font-bold text-indigo-500">{profilePercentage}</span>
                           <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-tighter">Score</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-gray-400">
                           <span>Profile score</span>
                           <span>{profilePercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${profilePercentage}%` }}></div>
                        </div>
                     </div>
                  </GlassCard>
               </div>
            </div>

            {/* Live Briefs Banner (Phase 2 Feature) */}
            <div
               onClick={() => onNavigate('briefs')}
               className="p-1 rounded-[2rem] bg-gradient-to-r from-orange-500/20 to-yellow-500/20 cursor-pointer group hover:scale-[1.02] transition-all"
            >
               <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[1.8rem] p-5 flex items-center gap-4 border border-orange-500/20">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30 group-hover:rotate-12 transition-transform">
                     <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">Live Briefs</h4>
                        <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-white/40 font-medium">Apply to time-sensitive brand deals today.</p>
                  </div>
                  <ChevronRight className="text-gray-400" />
               </div>
            </div>

            {/* Action Banners */}
            <div className="space-y-4">
               {user.isPremium && (
                  <div
                     onClick={isBoostActive ? undefined : handleBoost}
                     className={`p-1 rounded-[2rem] bg-gradient-to-r ${isBoostActive ? 'from-green-500/20 to-emerald-500/20' : 'from-pink-500/20 to-orange-500/20'} cursor-pointer transform hover:scale-[1.02] transition-all`}
                  >
                     <div className={`bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[1.8rem] p-5 flex items-center gap-4 border ${isBoostActive ? 'border-green-500/20' : 'border-pink-500/20'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg ${isBoostActive ? 'bg-green-500 shadow-green-500/30' : 'bg-gradient-to-r from-pink-500 to-orange-400 shadow-pink-500/30'} ${isBoosting ? 'animate-pulse' : ''}`}>
                           {isBoostActive ? <TrendingUp size={24} /> : <Zap size={24} fill="white" />}
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-gray-900 dark:text-white">
                              {isBoostActive ? 'Boost Active!' : 'Discovery Boost'}
                           </h4>
                           <p className="text-xs text-gray-500 dark:text-white/50">
                              {isBoostActive ? `Ends in ${formatTime(boostTimeRemaining)}` : 'Get +500% more profile views.'}
                           </p>
                        </div>
                        {!isBoostActive && <Zap size={20} className="text-pink-500 animate-bounce" />}
                        {isBoostActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>}
                     </div>
                  </div>
               )}

               {!user.verified && (
                  <div className="p-1 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 cursor-pointer">
                     <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[1.8rem] p-5 flex items-center gap-4 border border-blue-500/20">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                           <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-gray-900 dark:text-white">Get Verified</h4>
                           <p className="text-xs text-gray-500 dark:text-white/50">Build trust and get +300% visibility.</p>
                        </div>
                        <ChevronRight className="text-gray-400" />
                     </div>
                  </div>
               )}

               {!user.isPremium && (
                  <div onClick={onUpgrade} className="p-1 rounded-[2rem] bg-gradient-to-r from-yellow-500/20 to-orange-500/20 cursor-pointer">
                     <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[1.8rem] p-5 flex items-center gap-4 border border-yellow-500/20">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30">
                           <Crown size={24} fill="white" />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-gray-900 dark:text-white">Upgrade to Gold</h4>
                           <p className="text-xs text-gray-500 dark:text-white/50">Unlock unlimited swipes & insights.</p>
                        </div>
                        <ChevronRight className="text-gray-400" />
                     </div>
                  </div>
               )}
            </div>

         </div>


      </div>
   );
};
