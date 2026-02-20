
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, Zap, MessageCircle, Bell, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onBack: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onBack }) => {
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'match': return { icon: Heart, color: 'text-pink-500' };
      case 'message': return { icon: MessageCircle, color: 'text-blue-400' };
      case 'tip': return { icon: Zap, color: 'text-purple-500' };
      case 'system': 
      default: return { icon: CheckCircle2, color: 'text-green-500' };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[150] bg-white dark:bg-[#0f0c29] flex flex-col h-full transition-colors duration-300"
    >
      <div className="p-6 flex items-center gap-4 border-b border-pink-100 dark:border-white/5 bg-white/90 dark:bg-white/5 backdrop-blur-xl shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-white/80 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
           Notifications
           {notifications.length > 0 && (
             <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">{notifications.length}</span>
           )}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-white/30 space-y-3 opacity-60">
             <Bell size={48} />
             <p className="text-sm font-bold uppercase tracking-widest">No Notifications</p>
             <p className="text-xs">We'll let you know when something happens.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const style = getIcon(notif.type);
            return (
              <GlassCard key={notif.id} className="p-4 flex gap-4 items-start cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 transition-colors bg-gray-50 dark:bg-white/5" intensity="low">
                 <div className={`p-3 rounded-full bg-white/50 dark:bg-white/5 ${style.color} shrink-0`}>
                    <style.icon size={20} fill={notif.type === 'match' ? 'currentColor' : 'none'} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h3 className="font-bold text-sm text-gray-900 dark:text-white">{notif.title}</h3>
                       <span className="text-[10px] text-gray-400 dark:text-white/40 whitespace-nowrap ml-2">
                         {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white/60 mt-1 leading-relaxed truncate">
                       {notif.text}
                    </p>
                 </div>
                 {!notif.read && <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 shrink-0 animate-pulse"></div>}
              </GlassCard>
            );
          })
        )}
        
        {notifications.length > 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-white/30 space-y-2 opacity-50">
             <p className="text-xs uppercase tracking-widest">You're all caught up</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
