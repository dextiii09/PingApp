import React, { useState } from 'react';
import { User, UserRole, Match, Notification } from '../types';
import { GlassCard } from './GlassCard';
import { Heart, Search, Zap, TrendingUp, LayoutGrid, Crown, ShieldCheck, ChevronRight, Briefcase, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface DashboardProps {
   user: User;
   onNavigate: (view: string) => void;
   onUpgrade: () => void;
   onSettingsClick: () => void;
   newLikesCount: number;
   onUpdateUser: (data: Partial<User>) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
   user,
   onNavigate,
   onUpgrade,
   onSettingsClick,
   newLikesCount,
   onUpdateUser
}) => {


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

                  <div className="space-y-4">
                     <GlassCard
                        className="p-4 flex items-center justify-between h-[4.5rem] bg-gray-50 dark:bg-white/5"
                        hoverEffect
                        onClick={() => onNavigate('analytics')}
                     >
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><TrendingUp size={18} /></div>
                           <span className="text-sm font-bold text-gray-900 dark:text-white">Analytics</span>
                        </div>
                     </GlassCard>

                     <GlassCard
                        className="p-4 flex items-center justify-between h-[4.5rem] bg-gray-50 dark:bg-white/5"
                        hoverEffect
                        onClick={() => onNavigate(user.role === UserRole.BUSINESS ? 'analytics' : 'profile')}
                     >
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                              {user.role === UserRole.BUSINESS ? <Briefcase size={18} /> : <LayoutGrid size={18} />}
                           </div>
                           <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {user.role === UserRole.BUSINESS ? 'Budget' : 'Media Kit'}
                           </span>
                        </div>
                     </GlassCard>
                  </div>
               </div>
            </div>

            {/* Action Banners */}
            <div className="space-y-4">
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
