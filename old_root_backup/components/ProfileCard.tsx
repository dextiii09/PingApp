
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { 
  MapPin, CheckCircle2, Briefcase, Building2, GraduationCap, 
  PlayCircle, PauseCircle, Mic, StopCircle, Instagram, Twitter, 
  Youtube, Linkedin, Globe, DollarSign, Users as UsersIcon, Zap, 
  LayoutGrid, Sparkles, Lock, Volume2, VolumeX, X, Facebook
} from 'lucide-react';

const StatBadge: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-black/40 backdrop-blur-md rounded-xl p-2.5 border border-white/5 flex flex-col justify-center">
    <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">
      {icon} {label}
    </div>
    <div className="text-white font-bold text-sm">{value}</div>
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
    <div className="w-full h-full overflow-hidden relative bg-[#1a1a1a] border border-white/20 rounded-3xl !p-0 shadow-2xl">
       {/* Background Media */}
       <div className="absolute inset-0 z-0">
          {isPlaying && user.introVideoUrl ? (
             <video 
                ref={videoRef}
                src={user.introVideoUrl}
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
             />
          )}
          {user.voiceIntroUrl && (
             <audio ref={audioRef} src={user.voiceIntroUrl} onEnded={() => setIsAudioPlaying(false)} />
          )}
       </div>
       
       {/* Overlays */}
       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />
       {/* Deeper gradient at bottom for text readability */}
       <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

       {/* AI Analysis Badge - Premium Logic */}
       {user.aiMatchScore && !isPlaying && (
          <div className="absolute top-4 left-4 right-4 z-20">
             {isPremium ? (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 flex items-start gap-3 shadow-lg">
                    <div className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white font-bold text-xs rounded-lg p-2 shrink-0 shadow-inner">
                    {user.aiMatchScore}%
                    </div>
                    <div>
                    <div className="flex items-center gap-1 text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                        <Sparkles size={10} /> AI Insight
                    </div>
                    <p className="text-xs text-white/90 leading-tight mt-0.5">{user.aiMatchReason}</p>
                    </div>
                </div>
             ) : (
                <div 
                   onClick={(e) => { e.stopPropagation(); onUpgrade && onUpgrade(); }}
                   className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg cursor-pointer group hover:bg-black/80 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 text-white/40 font-bold text-xs rounded-lg p-2 shrink-0 shadow-inner">
                           <Lock size={12} />
                        </div>
                        <div>
                           <div className="flex items-center gap-1 text-[10px] text-pink-300/50 font-bold uppercase tracking-wider">
                              AI Insight Locked
                           </div>
                           <p className="text-xs text-white/50 leading-tight mt-0.5">Unlock advanced match analysis</p>
                        </div>
                    </div>
                    <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg group-hover:scale-105 transition-transform">
                        UPGRADE
                    </button>
                </div>
             )}
          </div>
       )}
       
       {/* Video Controls (Visible when playing) */}
       {isPlaying && (
          <div className="absolute top-4 right-4 z-40 flex flex-col gap-3">
             <button 
                onClick={toggleVideo}
                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
             >
                <X size={18} />
             </button>
             <button 
                onClick={toggleMute}
                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
             >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>
          </div>
       )}

       {/* Content Area */}
       <div className={`absolute bottom-0 left-0 w-full p-6 pb-8 text-left z-20 ${expanded ? 'h-full overflow-y-auto bg-black/60 backdrop-blur-md pt-24 pointer-events-auto no-scrollbar' : 'pointer-events-none'}`}>
         <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">{user.name}</h2>
            {user.verified && <CheckCircle2 className="text-blue-400 fill-white/10" size={24} />}
         </div>

         <div className="flex flex-wrap items-center gap-2 mb-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <MapPin size={12} className="text-pink-400" /> {user.location || 'Unknown'}
             </div>
             
             {user.jobTitle && (
               <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-blue-400" /> {user.jobTitle}
               </div>
             )}
             {user.company && (
               <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Building2 size={12} className="text-purple-400" /> {user.company}
               </div>
             )}
             {user.school && (
               <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <GraduationCap size={12} className="text-yellow-400" /> {user.school}
               </div>
             )}
         </div>

         {/* Media & Socials Row */}
         <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar pb-1 pointer-events-auto">
            {/* Video Button */}
            {user.introVideoUrl && (
              <button 
                onClick={toggleVideo} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isPlaying ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                 {isPlaying ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                 {isPlaying ? 'Playing' : 'Intro'}
              </button>
            )}

            {/* Audio Button */}
            {user.voiceIntroUrl && (
              <button 
                onClick={toggleAudio} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isAudioPlaying ? 'bg-purple-500 text-white border-purple-400' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                 {isAudioPlaying ? <StopCircle size={14} /> : <Mic size={14} />}
                 {isAudioPlaying ? 'Listening' : 'Voice'}
              </button>
            )}

            {/* Divider */}
            {(user.introVideoUrl || user.voiceIntroUrl) && user.socials && Object.values(user.socials).some(v => v) && (
               <div className="w-px h-5 bg-white/20 mx-1 shrink-0"></div>
            )}

            {/* Social Icons */}
            {user.socials && (
               <div className="flex items-center gap-2">
                  {user.socials.instagram && (
                     <a href={`https://instagram.com/${user.socials.instagram.replace('@','')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/10 rounded-full hover:bg-pink-600 hover:text-white text-white/80 transition-colors">
                        <Instagram size={14} />
                     </a>
                  )}
                  {user.socials.twitter && (
                     <a href={`https://twitter.com/${user.socials.twitter.replace('@','')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/10 rounded-full hover:bg-blue-400 hover:text-white text-white/80 transition-colors">
                        <Twitter size={14} />
                     </a>
                  )}
                  {user.socials.youtube && (
                     <a href={user.socials.youtube} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/10 rounded-full hover:bg-red-600 hover:text-white text-white/80 transition-colors">
                        <Youtube size={14} />
                     </a>
                  )}
                  {user.socials.linkedin && (
                     <a href={user.socials.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/10 rounded-full hover:bg-blue-700 hover:text-white text-white/80 transition-colors">
                        <Linkedin size={14} />
                     </a>
                  )}
                  {user.socials.facebook && (
                     <a href={user.socials.facebook} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/10 rounded-full hover:bg-blue-600 hover:text-white text-white/80 transition-colors">
                        <Facebook size={14} />
                     </a>
                  )}
                  {user.website && (
                     <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white/10 rounded-full hover:bg-emerald-500 hover:text-white text-white/80 transition-colors">
                        <Globe size={14} />
                     </a>
                  )}
               </div>
            )}
         </div>

         <div className="grid grid-cols-2 gap-2 mb-4">
            {isInfluencerLookingAtBrand ? (
              <>
                 <StatBadge icon={<DollarSign size={14} className="text-green-400" />} label="Budget" value={user.stats?.budget || 'N/A'} />
                 <StatBadge icon={<Briefcase size={14} className="text-purple-400" />} label="Niche" value={user.tags[0]} />
              </>
            ) : (
              <>
                 <StatBadge icon={<UsersIcon size={14} className="text-pink-400" />} label="Followers" value={user.stats?.followers || '0'} />
                 <StatBadge icon={<Zap size={14} className="text-yellow-400" />} label="Engagement" value={user.stats?.engagement || '0%'} />
              </>
            )}
         </div>

         <p className={`text-white/80 text-sm leading-relaxed font-normal mb-4 ${expanded ? '' : 'line-clamp-2'}`}>
           {user.bio}
         </p>

         {/* Media Kit Preview */}
         {user.portfolio && user.portfolio.length > 0 && (
            <div className={expanded ? "grid grid-cols-3 gap-2 pb-4" : "flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-linear-fade"}>
                {user.portfolio.slice(0, expanded ? undefined : 3).map((img, i) => (
                    <div key={i} className={`shrink-0 rounded-lg overflow-hidden border border-white/20 ${expanded ? 'aspect-square w-full' : 'w-16 h-16'}`}>
                        <img src={img} className="w-full h-full object-cover" />
                    </div>
                ))}
                {!expanded && user.portfolio.length > 3 && (
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                        +{user.portfolio.length - 3}
                    </div>
                )}
            </div>
         )}
         
         {/* Extra Details when Expanded */}
         {expanded && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Interests</h4>
                <div className="flex flex-wrap gap-2">
                    {user.tags.map(tag => (
                        <span key={tag} className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-white/90 border border-white/5">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
         )}
         
       </div>
    </div>
  );
};
