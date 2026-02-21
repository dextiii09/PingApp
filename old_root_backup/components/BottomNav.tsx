
import React from 'react';
import { Home, MessageCircle, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: 'home' | 'matches' | 'profile';
  onTabChange: (tab: 'home' | 'matches' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'matches', icon: MessageCircle, label: 'Matches' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-8 left-0 w-full px-6 z-50 flex justify-center pointer-events-none">
      <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl shadow-black/20 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`
                relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300
                ${isActive ? 'text-pink-600 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'}
              `}
            >
              <div className="relative z-10">
                <tab.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-pink-500/10 dark:bg-white/10 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute bottom-2 w-1 h-1 bg-pink-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
