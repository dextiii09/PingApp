import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import {
   MapPin, CheckCircle2, Briefcase, Building2, GraduationCap,
   PlayCircle, PauseCircle, Mic, StopCircle, Instagram, Twitter,
   Youtube, Linkedin, Globe, IndianRupee, Users as UsersIcon, Zap,
   LayoutGrid, Sparkles, Lock, Volume2, VolumeX, X, Facebook, ShieldCheck
} from 'lucide-react';

const StatBadge: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
   <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 border border-white/10 flex flex-col justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-black/50 hover:border-white/20">
      <div className="flex items-center gap-1.5 text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">
         {icon} {label}
      </div>
      <div className="text-white font-bold text-base tracking-tight">{value}</div>
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

   // Audio State
   const [isAudioPlaying, setIsAudioPlaying] = useState(false);
   const audioRef = useRef<HTMLAudioElement>(null);

   // Autoplay video when expanded
   useEffect(() => {
      if (expanded && (user.mediaKitVideoUrl || user.introVideoUrl)) {
         setIsPlaying(true);
      }
   }, [expanded, user]);

   const toggleVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Stop audio if playing
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
         // Stop video if playing
         if (isPlaying) setIsPlaying(false);
         audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
   };

   return (
      <div className={`w-full h-full overflow-hidden relative bg-[#0a0a0a] rounded-3xl !p-0 shadow-2xl transition-all duration-500 ${expanded ? 'border border-white/10 shadow-[0_0_50px_rgba(236,72,153,0.15)]' : ''}`}>
         {/* Background Media */}
         <div className={`absolute inset-0 z-0 ${expanded ? '' : 'pointer-events-none'}`}>
            {(isPlaying || (user.boostExpiresAt && user.boostExpiresAt > Date.now())) && (user.mediaKitVideoUrl || user.introVideoUrl) ? (
               <video
                  ref={videoRef}
                  src={user.mediaKitVideoUrl || user.introVideoUrl}
                  className="w-full h-full object-cover scale-105 transition-transform duration-1000"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
               />
            ) : (
               <img
                  src={user.avatar}
                  className="w-full h-full object-cover pointer-events-none select-none scale-105 transition-transform duration-1000"
                  draggable={false}
                  alt={user.name}
               />
            )}
            {user.voiceIntroUrl && (
               <audio ref={audioRef} src={user.voiceIntroUrl} onEnded={() => setIsAudioPlaying(false)} />
            )}
         </div>

         {/* Advanced Overlays */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none z-10 opacity-60" />
         {/* Deeper gradient at bottom for text readability */}
         <div className={`absolute bottom-0 left-0 right-0 ${expanded ? 'h-[80%]' : 'h-3/4'} bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10 transition-all duration-500`} />

         {/* AI Analysis Badge - Premium Logic */}
         {user.aiMatchScore && !isPlaying && (
            <div className={`absolute top-5 left-5 right-5 z-20 ${expanded ? '' : 'pointer-events-none'}`}>
               {isPremium ? (
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 flex items-start gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white font-bold text-sm rounded-xl p-2.5 shrink-0 shadow-inner relative z-10 flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="leading-none">{user.aiMatchScore}</span>
                        <span className="text-[8px] uppercase tracking-widest opacity-80 mt-0.5">Match</span>
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-1.5 text-[10px] text-pink-300 font-bold uppercase tracking-widest mb-1">
                           <Sparkles size={12} className="animate-pulse" /> AI Insight
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed font-medium">{user.aiMatchReason}</p>
                     </div>
                  </div>
               ) : (
                  <div
                     onClick={(e) => { e.stopPropagation(); onUpgrade && onUpgrade(); }}
                     className="bg-black/70 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer group hover:bg-black/90 transition-all overflow-hidden relative"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-white/5 text-white/50 border border-white/10 font-bold text-sm rounded-xl p-2.5 shrink-0 shadow-inner flex flex-col items-center justify-center min-w-[3rem]">
                           <Lock size={14} className="mb-0.5" />
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5 text-[10px] text-pink-400 font-bold uppercase tracking-widest mb-1">
                              Match Insight Locked
                           </div>
                           <p className="text-xs text-white/60 leading-relaxed font-medium">Unlock advanced Ping AI analysis</p>
                        </div>
                     </div>
                     <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] group-hover:scale-105 transition-all relative z-10 whitespace-nowrap">
                        PING GOLD
                     </button>
                  </div>
               )}
            </div>
         )}

         {/* Ping Score Badge - Discovery trust indicator */}
         {!isPlaying && (
            <div className={`absolute top-5 right-5 z-20 ${expanded ? 'pointer-events-none' : ''}`}>
               {!user.aiMatchScore && ( // Only show if AI Match Score isn't taking up the top slot
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                     <ShieldCheck size={14} className="text-indigo-400" />
                     <span className="text-xs font-bold text-white/90 tracking-wider blur-0">
                        {user.pingScore || 75}
                     </span>
                  </div>
               )}
            </div>
         )}

         {/* Video Controls (Visible when playing) */}
         {isPlaying && (
            <div className="absolute top-5 right-5 z-40 flex flex-col gap-3">
               <button
                  onClick={toggleVideo}
                  className="w-12 h-12 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/70 hover:scale-105 transition-all shadow-lg"
               >
                  <X size={20} />
               </button>
               <button
                  onClick={toggleMute}
                  className="w-12 h-12 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/70 hover:scale-105 transition-all shadow-lg"
               >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
               </button>
            </div>
         )}

         {/* Content Area */}
         <div className={`absolute bottom-0 left-0 w-full px-6 py-8 text-left z-20 ${expanded ? 'h-full overflow-y-auto bg-black/40 backdrop-blur-2xl pt-28 pointer-events-auto no-scrollbar' : 'pointer-events-none'}`}>

            {/* Name & Verification */}
            <div className="flex items-center gap-2 mb-3">
               <h2 className="text-4xl font-extrabold text-white drop-shadow-xl tracking-tight">{user.name}</h2>
               {user.verified && <CheckCircle2 className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" size={28} />}
            </div>

            {/* Tags/Pills Row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
               <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2 shadow-sm">
                  <MapPin size={12} className="text-pink-400" /> {user.location || 'Unknown'}
               </div>

               {user.jobTitle && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2 shadow-sm">
                     <Briefcase size={12} className="text-blue-400" /> {user.jobTitle}
                  </div>
               )}
               {user.company && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2 shadow-sm">
                     <Building2 size={12} className="text-purple-400" /> {user.company}
                  </div>
               )}
               {user.school && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2 shadow-sm">
                     <GraduationCap size={12} className="text-yellow-400" /> {user.school}
                  </div>
               )}
            </div>

            {/* Media & Socials Row */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto no-scrollbar pb-2 pointer-events-auto">
               {/* Video Button */}
               {user.introVideoUrl && (
                  <button
                     onClick={toggleVideo}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-lg ${isPlaying ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/10 backdrop-blur-xl text-white border-white/20 hover:bg-white/20 hover:scale-105'}`}
                  >
                     {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} className="text-pink-400" />}
                     {isPlaying ? 'Playing' : 'Intro Video'}
                  </button>
               )}

               {/* Audio Button */}
               {user.voiceIntroUrl && (
                  <button
                     onClick={toggleAudio}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-lg ${isAudioPlaying ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-white/10 backdrop-blur-xl text-white border-white/20 hover:bg-white/20 hover:scale-105'}`}
                  >
                     {isAudioPlaying ? <StopCircle size={16} /> : <Mic size={16} className="text-purple-400" />}
                     {isAudioPlaying ? 'Listening' : 'Voice Intro'}
                  </button>
               )}

               {/* Divider */}
               {(user.introVideoUrl || user.voiceIntroUrl) && user.socials && Object.values(user.socials).some(v => v) && (
                  <div className="w-px h-6 bg-white/20 mx-1 shrink-0"></div>
               )}

               {/* Social Icons */}
               {user.socials && (
                  <div className="flex items-center gap-2">
                     {user.socials.instagram && (
                        <a href={`https://instagram.com/${user.socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:border-transparent text-white transition-all shadow-sm hover:scale-110">
                           <Instagram size={14} />
                        </a>
                     )}
                     {user.socials.twitter && (
                        <a href={`https://twitter.com/${user.socials.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-blue-400 hover:border-blue-400 text-white transition-all shadow-sm hover:scale-110">
                           <Twitter size={14} />
                        </a>
                     )}
                     {user.socials.youtube && (
                        <a href={user.socials.youtube} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-red-600 hover:border-red-600 text-white transition-all shadow-sm hover:scale-110">
                           <Youtube size={14} />
                        </a>
                     )}
                     {user.socials.linkedin && (
                        <a href={user.socials.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-blue-700 hover:border-blue-700 text-white transition-all shadow-sm hover:scale-110">
                           <Linkedin size={14} />
                        </a>
                     )}
                     {user.socials.facebook && (
                        <a href={user.socials.facebook} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-blue-600 hover:border-blue-600 text-white transition-all shadow-sm hover:scale-110">
                           <Facebook size={14} />
                        </a>
                     )}
                     {user.website && (
                        <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full hover:bg-emerald-500 hover:border-emerald-500 text-white transition-all shadow-sm hover:scale-110">
                           <Globe size={14} />
                        </a>
                     )}
                  </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
               {isInfluencerLookingAtBrand ? (
                  <>
                     <StatBadge icon={<IndianRupee size={14} className="text-green-400" />} label="Budget" value={user.stats?.budget?.replace(/\$/g, '₹') || 'N/A'} />
                     <StatBadge icon={<Briefcase size={14} className="text-purple-400" />} label="Niche" value={user.tags[0]} />
                  </>
               ) : (
                  <>
                     <StatBadge icon={<Instagram size={14} className="text-pink-400" />} label="Instagram" value={user.socialStats?.instagramFollowers || user.stats?.followers || '0'} />
                     <StatBadge icon={<Zap size={14} className="text-yellow-400" />} label="Engagement" value={user.socialStats?.avgEngagement || user.stats?.engagement || '0%'} />
                  </>
               )}
            </div>

            {expanded && !isInfluencerLookingAtBrand && user.socialStats && (
               <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatBadge icon={<Youtube size={14} className="text-red-500" />} label="YouTube" value={user.socialStats.youtubeSubscribers || '0'} />
                  <StatBadge icon={<Zap size={14} className="text-blue-400" />} label="TikTok" value={user.socialStats.tiktokFollowers || '0'} />
               </div>
            )}

            <p className={`text-white/80 text-[15px] leading-relaxed font-medium mb-6 ${expanded ? '' : 'line-clamp-2'} drop-shadow-sm`}>
               {user.bio}
            </p>

            {/* Media Kit Preview */}
            {user.portfolio && user.portfolio.length > 0 && (
               <div className={expanded ? "grid grid-cols-3 gap-3 pb-6" : "flex gap-3 overflow-x-auto pb-2 no-scrollbar mask-linear-fade"}>
                  {user.portfolio.slice(0, expanded ? undefined : 3).map((img, i) => (
                     <div key={i} className={`shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg ${expanded ? 'aspect-square w-full hover:scale-105 transition-transform' : 'w-20 h-20'}`}>
                        <img src={img} className="w-full h-full object-cover" alt="Portfolio item" />
                     </div>
                  ))}
                  {!expanded && user.portfolio.length > 3 && (
                     <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                        +{user.portfolio.length - 3}
                     </div>
                  )}
               </div>
            )}

            {/* Extra Details when Expanded */}
            {expanded && (
               <div className="mt-2 pt-6 border-t border-white/10 space-y-6">
                  {/* Trust Metrics */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-indigo-400" /> Trust & Performance
                     </h4>
                     <div className="grid grid-cols-3 gap-3">
                        <StatBadge icon={<ShieldCheck size={14} className="text-indigo-400" />} label="Ping Score" value={String(user.pingScore || 75)} />
                        {user.completionRate !== undefined && (
                           <StatBadge icon={<CheckCircle2 size={14} className="text-green-400" />} label="Completion" value={`${user.completionRate}%`} />
                        )}
                        {user.responseTime && (
                           <StatBadge icon={<Zap size={14} className="text-yellow-400" />} label="Response" value={user.responseTime} />
                        )}
                     </div>
                  </div>

                  {/* Business Details (If applicable) */}
                  {(user.industry || user.companySize) && (
                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                           <Building2 size={14} className="text-purple-400" /> Business Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           {user.industry && <StatBadge icon={<Briefcase size={14} className="text-purple-400" />} label="Industry" value={user.industry} />}
                           {user.companySize && <StatBadge icon={<UsersIcon size={14} className="text-blue-400" />} label="Size" value={user.companySize} />}
                        </div>
                     </div>
                  )}

                  <div className="space-y-4">
                     <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-pink-400" /> Key Interests
                     </h4>
                     <div className="flex flex-wrap gap-2.5">
                        {user.tags.map(tag => (
                           <span key={tag} className="text-[13px] font-bold bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 border border-white/10 hover:bg-white/20 transition-colors shadow-sm">
                              #{tag}
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