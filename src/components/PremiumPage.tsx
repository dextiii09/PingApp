import React from 'react';
import { User } from '../types';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { Check, Star, X } from 'lucide-react';

interface PremiumPageProps {
  user: User;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ user, onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 relative overflow-hidden" intensity="high">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <X size={24} />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Star size={32} className="text-white" fill="white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h2>
          <p className="text-white/60">Unlock exclusive features and boost your visibility.</p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            "Unlimited Swipes",
            "See Who Liked You",
            "Advanced Filters",
            "Priority Support",
            "AI Profile Insights"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-white/80">
              <div className="bg-green-500/20 p-1 rounded-full">
                <Check size={14} className="text-green-400" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button onClick={onUpgrade} fullWidth className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 border-none">
          Get Premium - $9.99/mo
        </Button>
      </GlassCard>
    </div>
  );
};
