
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { User, UserRole } from '../types';
import { X, Share2, QrCode, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import { APP_LOGO } from '../constants';
import { Button } from './Button';

interface PingIDProps {
  user: User;
  onClose: () => void;
}

export const PingID: React.FC<PingIDProps> = ({ user, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  // Holographic Sheen
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Ping ID: ${user.name}`,
      text: `Connect with me on Ping!`,
      url: `https://ping.app/u/${user.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const isBusiness = user.role === UserRole.BUSINESS;
  const gradient = isBusiness 
    ? "from-blue-600 to-purple-600"
    : "from-pink-500 to-orange-500";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-4 perspective-1000">
       <button 
         onClick={onClose} 
         className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
       >
         <X size={24} />
       </button>

       <div className="mb-8 text-center space-y-2">
         <h2 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Ping</span> ID
         </h2>
         <p className="text-white/50 text-sm">Tilt to explore • Tap to share</p>
       </div>

       <motion.div
         ref={ref}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
         style={{
           rotateX,
           rotateY,
           transformStyle: "preserve-3d",
         }}
         className="relative w-full max-w-[340px] aspect-[3/5] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-200"
       >
         {/* Card Background */}
         <div className={`absolute inset-0 bg-gradient-to-br ${gradient} p-[2px]`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
            
            {/* Main Content Container */}
            <div className="relative h-full w-full bg-black/80 rounded-[30px] overflow-hidden flex flex-col items-center p-6 border border-white/10">
               
               {/* Decorative Circles */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
               
               {/* Logo Header */}
               <div className="w-full flex justify-between items-center mb-8 relative z-10">
                  <img src={APP_LOGO} className="w-8 h-8 object-contain opacity-80" />
                  <div className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
                     <span className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-widest">
                       {user.isPremium ? "GOLD MEMBER" : "MEMBER"}
                     </span>
                  </div>
               </div>

               {/* Avatar Ring */}
               <div className="relative w-32 h-32 mb-6 z-10">
                  {/* Rotating Border */}
                  <div className={`absolute inset-[-4px] rounded-full bg-gradient-to-tr ${gradient} animate-spin-slow opacity-70`}></div>
                  <div className="absolute inset-0 rounded-full bg-black p-1">
                     <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                  </div>
                  {user.verified && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-4 border-black">
                       <ShieldCheck size={16} />
                    </div>
                  )}
               </div>

               {/* User Info */}
               <div className="text-center space-y-1 mb-8 relative z-10">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <p className="text-white/50 text-sm font-medium">@{user.name.replace(/\s+/g, '').toLowerCase()}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-3">
                     <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white/80 border border-white/10 uppercase">
                        {user.role}
                     </span>
                     {user.stats && (
                       <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white/80 border border-white/10 uppercase">
                         {isBusiness ? user.stats.budget : user.stats.followers}
                       </span>
                     )}
                  </div>
               </div>

               {/* QR Code Section */}
               <div className="mt-auto bg-white p-4 rounded-2xl shadow-lg relative group cursor-pointer z-10" onClick={handleShare}>
                  <QrCode size={120} className="text-black" />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                     <Share2 className="text-black" size={32} />
                  </div>
               </div>
               <p className="text-[10px] text-white/30 font-mono mt-4 uppercase tracking-widest">Scan to Connect</p>

            </div>
         </div>

         {/* Holographic Overlay */}
         <motion.div 
            style={{
               background: `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 25%, transparent 30%)`,
               backgroundPositionX: sheenX,
               backgroundPositionY: sheenY,
            }}
            className="absolute inset-0 rounded-[32px] pointer-events-none z-20 mix-blend-overlay opacity-50"
         />
         
         {/* Glare */}
         <motion.div 
            style={{
               opacity: useTransform(mouseYSpring, [-0.5, 0.5], [0, 0.3]),
               background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)'
            }}
            className="absolute inset-0 rounded-[32px] pointer-events-none z-20"
         />

       </motion.div>

       <div className="mt-12 w-full max-w-xs">
          <Button fullWidth onClick={handleShare} className="bg-white text-black hover:bg-gray-100 border-none shadow-xl">
             Share Profile
          </Button>
       </div>
    </div>
  );
};
