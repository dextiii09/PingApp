
import React, { useState, useEffect } from 'react';
import { User, UserRole, VerificationStatus } from '../types';
import { GlassCard } from './GlassCard';
import { Bell, Settings, Search, MessageCircle, BarChart3, Shield, Zap, LayoutGrid, Heart, Sparkles, Crown, X, Upload, FileText, CheckCircle, ShieldCheck, Video, Film, PlayCircle, Trash2, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { APP_LOGO } from '../constants';

interface DashboardProps {
  user: User;
  onNavigate: (view: 'deck' | 'matches' | 'profile' | 'analytics' | 'likes') => void;
  onSettingsClick: () => void;
  onUpgrade?: () => void;
  onNotificationsClick?: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  notificationCount: number;
  newLikesCount: number;
}

const VerificationModal = ({ onClose, userRole, onUpdateUser }: { onClose: () => void; userRole: UserRole; onUpdateUser: (data: Partial<User>) => void; }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'video'>('docs');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docStatus, setDocStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const isBusiness = userRole === UserRole.BUSINESS;

  useEffect(() => { return () => { if (videoPreview) URL.revokeObjectURL(videoPreview); }; }, [videoPreview]);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setDocFile(e.target.files[0]); };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) { alert("Video too large."); return; }
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 31) { alert("Max 30s."); return; }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setVideoStatus('idle');
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleDocUpload = () => {
    if (!docFile) return;
    setDocStatus('uploading');
    setTimeout(() => {
      onUpdateUser({ docUrl: URL.createObjectURL(docFile), verificationStatus: VerificationStatus.PENDING });
      setDocStatus('success');
    }, 2000);
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setVideoStatus('uploading');
    setTimeout(() => {
      if (videoPreview) onUpdateUser({ introVideoUrl: videoPreview });
      setVideoStatus('success');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2"><ShieldCheck className="text-blue-500" size={20} /> Verification</h3>
          <button onClick={onClose}><X size={20} className="text-white/60 hover:text-white" /></button>
        </div>
        <div className="p-6">
           <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
              <button onClick={() => setActiveTab('docs')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'docs' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Docs</button>
              <button onClick={() => setActiveTab('video')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'video' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Video</button>
           </div>
           {activeTab === 'docs' ? (
              <div className="space-y-4 text-center">
                 {docStatus === 'success' ? <div className="text-green-500 font-bold">Docs Submitted!</div> : (
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/5 relative">
                       <input type="file" onChange={handleDocChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                       <Upload size={32} className="mx-auto mb-2 text-white/40" />
                       <p className="text-sm text-white/60">{docFile ? docFile.name : "Upload ID/Business Doc"}</p>
                    </div>
                 )}
                 <Button fullWidth onClick={handleDocUpload} disabled={!docFile || docStatus !== 'idle'}>{docStatus === 'uploading' ? 'Uploading...' : 'Submit'}</Button>
              </div>
           ) : (
              <div className="space-y-4 text-center">
                 {videoStatus === 'success' ? <div className="text-green-500 font-bold">Video Live!</div> : (
                    <div className="border-2 border-dashed border-white/10 rounded-2xl h-48 flex items-center justify-center relative bg-black/40 overflow-hidden">
                       <input type="file" accept="video/*" onChange={handleVideoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                       {videoPreview ? <video src={videoPreview} className="w-full h-full object-cover" /> : <div className="text-white/40"><Video size={32} className="mx-auto mb-2"/>Upload Video</div>}
                    </div>
                 )}
                 <Button fullWidth onClick={handleVideoUpload} disabled={!videoFile || videoStatus !== 'idle'}>{videoStatus === 'uploading' ? 'Uploading...' : 'Upload'}</Button>
              </div>
           )}
        </div>
      </motion.div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onSettingsClick, onUpgrade, onNotificationsClick, onUpdateUser, notificationCount, newLikesCount }) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  return (
    <div className="h-full w-full flex flex-col relative overflow-y-auto no-scrollbar bg-white dark:bg-[#050505]">
      {/* Modern Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-20 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md transition-colors">
        <div className="flex flex-col">
           <span className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1">Welcome back</span>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             {user.name.split(' ')[0]}
             {user.isPremium && <Crown size={16} className="text-yellow-400 fill-yellow-400" />}
           </h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onNotificationsClick} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white hover:scale-105 transition-transform relative shadow-sm">
              <Bell size={20} />
              {notificationCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />}
           </button>
           <button onClick={onSettingsClick} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white hover:scale-105 transition-transform shadow-sm">
              <Settings size={20} />
           </button>
        </div>
      </div>

      <div className="px-6 pb-32 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Card - Discovery */}
        <div 
          onClick={() => onNavigate('deck')}
          className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl shadow-pink-500/10 transition-all hover:shadow-pink-500/20 hover:scale-[1.01]"
        >
           {/* Dynamic Background */}
           <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black dark:from-white dark:via-pink-100 dark:to-white"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/40 to-transparent mix-blend-overlay"></div>
           
           <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md rounded-full p-3 group-hover:rotate-12 transition-transform">
                 <Sparkles className="text-white dark:text-black" size={24} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-extrabold text-white dark:text-black mb-2">Start Matching</h2>
              <p className="text-white/70 dark:text-black/60 font-medium flex items-center gap-2">
                 Find your next collab <ChevronRight size={16} />
              </p>
           </div>
        </div>

        {/* Bento Grid Stats */}
        <div>
           <h3 className="text-sm font-bold text-gray-500 dark:text-white/40 mb-4 px-1">Overview</h3>
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
                   onClick={() => onNavigate('profile')}
                 >
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><LayoutGrid size={18} /></div>
                       <span className="text-sm font-bold text-gray-900 dark:text-white">Media Kit</span>
                    </div>
                 </GlassCard>
              </div>
           </div>
        </div>

        {/* Action Banners */}
        <div className="space-y-4">
           {!user.verified && (
             <div onClick={() => setShowVerificationModal(true)} className="p-1 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 cursor-pointer">
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

      <AnimatePresence>
         {showVerificationModal && <VerificationModal onClose={() => setShowVerificationModal(false)} userRole={user.role} onUpdateUser={onUpdateUser} />}
      </AnimatePresence>
    </div>
  );
};
