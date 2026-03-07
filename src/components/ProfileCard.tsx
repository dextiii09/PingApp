import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import {
   MapPin, CheckCircle2, Briefcase, Building2, GraduationCap,
   PlayCircle, PauseCircle, Mic, StopCircle, Instagram, Twitter,
   Youtube, Linkedin, Globe, IndianRupee, Users as UsersIcon, Zap,
   Sparkles, Lock, Volume2, VolumeX, X, Facebook, ShieldCheck, Star, Clock
} from 'lucide-react';

const StatBadge: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
   <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10 flex flex-col justify-center transition-all hover:bg-gray-100 dark:hover:bg-white/10">
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">
         {icon} {label}
      </div>
      <div className="text-gray-900 dark:text-white font-bold text-base tracking-tight">{value}</div>
   </div>
);

interface ProfileCardProps {
   user: User;
   role?: UserRole;
   isPremium?: boolean;
   onUpgrade?: () => void;
   expanded?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, role, isPremium, onUpgrade, expanded = false }) => {
   const isInfluencerLookingAtBrand = role === UserRole.INFLUENCER;
   const [isPlaying, setIsPlaying] = useState(false);
   const [isMuted, setIsMuted] = useState(false);
   const videoRef = useRef<HTMLVideoElement>(null);

   const [isAudioPlaying, setIsAudioPlaying] = useState(false);
   const audioRef = useRef<HTMLAudioElement>(null);

   useEffect(() => {
      if (expanded && (user.mediaKitVideoUrl || user.introVideoUrl)) {
         setIsPlaying(true);
      }
   }, [expanded, user]);

   const toggleVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isAudioPlaying) {
         audioRef.current?.pause();
         setIsAudioPlaying(false);
      }
      setIsPlaying(prev => !prev);
   };

   const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMuted(prev => !prev);
   };

   const toggleAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!audioRef.current) return;

      if (isAudioPlaying) {
         audioRef.current.pause();
      } else {
         if (isPlaying) setIsPlaying(false);
         audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
   };

   return (
      <div className={`flex flex-col w-full h-full overflow-hidden bg-white dark:bg-[#121212] rounded-[2rem] shadow-xl border border-gray-200 dark:border-white/10 transition-all duration-300 ${expanded ? 'ring-4 ring-gray-100 dark:ring-white/5' : ''}`}>

         {/* Top Half: Media */}
         <div className={`relative w-full shrink-0 ${expanded ? 'h-[40%]' : 'h-[50%]'} bg-gray-100 dark:bg-[#0a0a0a]`}>
            {(isPlaying || (user.boostExpiresAt && user.boostExpiresAt > Date.now())) && (user.mediaKitVideoUrl || user.introVideoUrl) ? (
               <video
                  ref={videoRef}
                  src={user.mediaKitVideoUrl || user.introVideoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
               />
            ) : (
               <img
                  src={user.avatar}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                  alt={user.name}
               />
            )}
            {user.voiceIntroUrl && (
               <audio ref={audioRef} src={user.voiceIntroUrl} onEnded={() => setIsAudioPlaying(false)} />
            )}

            {/* Gradient Overlay for Top Icons */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />

            {/* Ping Score & Rating Badge - Top Right */}
            {!isPlaying && (
               <div className={`absolute top-4 right-4 z-20 flex flex-col gap-2 ${expanded ? 'pointer-events-none' : ''}`}>
                  {!user.aiMatchScore && (
                     <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm w-fit ml-auto">
                        <ShieldCheck size={14} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white tracking-wider">
                           {user.pingScore || 75}
                        </span>
                     </div>
                  )}
                  {user.rating && (
                     <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm w-fit ml-auto">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                           {user.rating} <span className="text-gray-500 dark:text-white/50 font-normal ml-0.5">({user.reviewCount})</span>
                        </span>
                     </div>
                  )}
               </div>
            )}

            {/* Video Controls */}
            {isPlaying && (
               <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
                  <button onClick={toggleVideo} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/70 transition-all">
                     <X size={18} />
                  </button>
                  <button onClick={toggleMute} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/70 transition-all">
                     {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
               </div>
            )}

            {/* AI Analysis Badge - Positioned cleanly over media */}
            {user.aiMatchScore && !isPlaying && (
               <div className={`absolute bottom-4 left-4 right-4 z-20 ${expanded ? '' : 'pointer-events-none'}`}>
                  {isPremium ? (
                     <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-3 flex items-start gap-3 shadow-lg">
                        <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg p-2 shrink-0 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-500/20">
                           <span className="leading-none text-base">{user.aiMatchScore}</span>
                           <span className="text-[9px] uppercase tracking-wider mt-0.5">Match</span>
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-white/50 font-bold uppercase tracking-widest mb-1">
                              <Sparkles size={12} className="text-blue-500" /> AI Insight
                           </div>
                           <p className="text-xs text-gray-800 dark:text-white/90 font-medium leading-relaxed">{user.aiMatchReason}</p>
                        </div>
                     </div>
                  ) : (
                     <div
                        onClick={(e) => { e.stopPropagation(); onUpgrade && onUpgrade(); }}
                        className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div className="bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 min-w-[3rem] flex items-center justify-center">
                              <Lock size={16} />
                           </div>
                           <div>
                              <div className="text-[10px] text-gray-500 dark:text-white/50 font-bold uppercase tracking-widest mb-0.5">
                                 Insight Locked
                              </div>
                              <p className="text-xs text-gray-800 dark:text-white/90 font-medium">Unlock match analysis</p>
                           </div>
                        </div>
                        <span className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
                           Upgrade
                        </span>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Bottom Half: Content Data */}
         <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-white dark:bg-[#121212] z-20">
            {/* Header: Name & Verification */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">{user.name}</h2>
                     {user.verified && <CheckCircle2 className="text-blue-500" size={24} />}
                  </div>
                  {/* Tags Pill Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                     <span className="text-xs font-bold text-gray-600 dark:text-white/60 flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" /> {user.location || 'Unknown'}
                     </span>
                     {user.jobTitle && (
                        <>
                           <span className="text-gray-300 dark:text-white/20">•</span>
                           <span className="text-xs font-medium text-gray-600 dark:text-white/60">{user.jobTitle}</span>
                        </>
                     )}
                  </div>
               </div>
            </div>

            {/* Brief Bio */}
            <p className={`text-gray-600 dark:text-white/80 text-sm leading-relaxed mb-6 ${expanded ? '' : 'line-clamp-2'}`}>
               {user.bio}
            </p>

            {/* Media & Socials Row */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto no-scrollbar pb-2 pointer-events-auto">
               {user.introVideoUrl && (
                  <button
                     onClick={toggleVideo}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${isPlaying ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                  >
                     {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} className="text-blue-500" />}
                     {isPlaying ? 'Playing' : 'Intro Video'}
                  </button>
               )}

               {user.voiceIntroUrl && (
                  <button
                     onClick={toggleAudio}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${isAudioPlaying ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                  >
                     {isAudioPlaying ? <StopCircle size={16} /> : <Mic size={16} className="text-purple-500" />}
                     {isAudioPlaying ? 'Listening' : 'Voice Intro'}
                  </button>
               )}

               {(user.introVideoUrl || user.voiceIntroUrl) && user.socials && Object.values(user.socials).some(v => v) && (
                  <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 shrink-0"></div>
               )}

               {user.socials && (
                  <div className="flex items-center gap-2">
                     {user.socials.instagram && (
                        <a href={`https://instagram.com/${user.socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                           <Instagram size={18} />
                        </a>
                     )}
                     {user.socials.twitter && (
                        <a href={`https://twitter.com/${user.socials.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                           <Twitter size={18} />
                        </a>
                     )}
                     {user.socials.youtube && (
                        <a href={user.socials.youtube} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                           <Youtube size={18} />
                        </a>
                     )}
                     {user.socials.linkedin && (
                        <a href={user.socials.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-blue-700 transition-colors">
                           <Linkedin size={18} />
                        </a>
                     )}
                     {user.website && (
                        <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
                           <Globe size={18} />
                        </a>
                     )}
                  </div>
               )}
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
               {isInfluencerLookingAtBrand ? (
                  <>
                     <StatBadge icon={<IndianRupee size={14} className="text-green-500" />} label="Budget" value={user.stats?.budget?.replace(/\$/g, '₹') || 'N/A'} />
                     <StatBadge icon={<Briefcase size={14} className="text-purple-500" />} label="Niche" value={user.tags[0] || 'Unspecified'} />
                  </>
               ) : (
                  <>
                     <StatBadge icon={<Instagram size={14} className="text-pink-500" />} label="Instagram" value={user.socialStats?.instagramFollowers || user.stats?.followers || '0'} />
                     <StatBadge icon={<Zap size={14} className="text-blue-500" />} label="Engagement" value={user.socialStats?.avgEngagement || user.stats?.engagement || '0%'} />
                  </>
               )}
            </div>

            {/* Expanded Content Only */}
            {expanded && (
               <div className="space-y-6 animate-in fade-in duration-300">

                  {/* Secondary Stats */}
                  {!isInfluencerLookingAtBrand && user.socialStats && (
                     <div className="grid grid-cols-2 gap-3">
                        <StatBadge icon={<Youtube size={14} className="text-red-500" />} label="YouTube Subs" value={user.socialStats.youtubeSubscribers || '0'} />
                        <StatBadge icon={<Globe size={14} className="text-emerald-500" />} label="TikTok" value={user.socialStats.tiktokFollowers || '0'} />
                     </div>
                  )}

                  {/* Portfolio Gallery */}
                  {user.portfolio && user.portfolio.length > 0 && (
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Selected Work</h4>
                        <div className="grid grid-cols-3 gap-3">
                           {user.portfolio.map((img, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:opacity-90 transition-opacity">
                                 <img src={img} className="w-full h-full object-cover" alt="Portfolio" loading="lazy" />
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Trust & Performance */}
                  <div className="space-y-3">
                     <h4 className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Platform Trust</h4>
                     <div className="grid grid-cols-2 gap-3">
                        {user.completionRate !== undefined && (
                           <StatBadge icon={<CheckCircle2 size={14} className="text-green-500" />} label="Completion" value={`${user.completionRate}%`} />
                        )}
                        {user.responseTime && (
                           <StatBadge icon={<Clock size={14} className="text-orange-500" />} label="Response" value={user.responseTime} />
                        )}
                     </div>
                  </div>

                  {/* Interests / Tags */}
                  <div className="space-y-3 pb-8">
                     <h4 className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Expertise</h4>
                     <div className="flex flex-wrap gap-2">
                        {user.tags.map(tag => (
                           <span key={tag} className="text-xs font-semibold bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-gray-700 dark:text-white/80 border border-gray-200 dark:border-white/5">
                              {tag}
                           </span>
                        ))}
                     </div>
                  </div>

               </div>
            )}
         </div>
      </div>
   );
};