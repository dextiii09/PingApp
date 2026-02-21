import React, { useState } from 'react';
import { User } from '../types';
import { Button } from './Button';
import { X, Crown, Check, Zap, Eye, BarChart3, Clock, Rocket, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumPageProps {
  user: User;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ user, onClose, onUpgrade }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const features = [
    { icon: <Zap size={20} className="text-yellow-400" />, title: 'Unlimited Swipes', desc: 'Swipe as much as you want without daily limits.' },
    { icon: <Eye size={20} className="text-pink-400" />, title: 'See Who Liked You', desc: 'Instantly match with people who already swiped right.' },
    { icon: <BarChart3 size={20} className="text-blue-400" />, title: 'Audience Demographics', desc: 'Deep dive into age, location, and interests of your viewers.' },
    { icon: <Rocket size={20} className="text-orange-400" />, title: 'Priority Placement', desc: 'Your profile gets shown first to top tier matches.' },
    { icon: <Clock size={20} className="text-purple-400" />, title: 'Read Receipts', desc: 'Know exactly when your messages are seen.' },
    { icon: <ShieldCheck size={20} className="text-green-400" />, title: 'Priority Support', desc: 'Jump the queue with 24/7 dedicated account assistance.' },
  ];

  const monthlyPrice = 1490;
  const yearlyPrice = 990; // per month

  return (
    <div className="fixed inset-0 z-[150] bg-[#050505] text-white flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-500/20 via-[#050505] to-[#050505] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] left-[-20%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center sticky top-0 bg-[#050505]/50 backdrop-blur-md">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/50">Ping Gold</div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="relative z-10 px-6 pb-24 max-w-lg mx-auto w-full flex-1 flex flex-col">

        {/* Title Area */}
        <div className="text-center mb-10 pt-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative inline-block mb-6 group">
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 rounded-full p-1 shadow-2xl flex items-center justify-center border-4 border-[#050505]">
              <Crown size={40} className="text-[#050505] fill-[#050505]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Unlock Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Full Potential.</span></h1>
          <p className="text-white/60 text-sm max-w-xs mx-auto">Get more matches, deeper insights, and premium features with Ping Gold.</p>
        </div>

        {/* Feature List */}
        <div className="space-y-4 mb-10 animate-in slide-in-from-bottom-6 duration-700 delay-100">
          {features.map((feat, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-bold text-base mb-0.5">{feat.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Toggle */}
        <div className="mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="bg-white/5 p-1 rounded-full flex max-w-[280px] mx-auto border border-white/10 relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all relative z-10 ${billingCycle === 'monthly' ? 'text-black' : 'text-white/60 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${billingCycle === 'yearly' ? 'text-black' : 'text-white/60 hover:text-white'}`}
            >
              Yearly <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider self-center">Save 33%</span>
            </button>

            {/* Slider Background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-transform duration-300 ease-out z-0 ${billingCycle === 'yearly' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
            />
          </div>
        </div>

        {/* Purchase Area */}
        <div className="mt-auto animate-in slide-in-from-bottom-10 duration-700 delay-300 text-center">
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={billingCycle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-5xl font-black">₹{billingCycle === 'yearly' ? yearlyPrice : monthlyPrice}</span>
                <span className="text-white/50 text-base font-medium"> / month</span>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-white/40 mt-2">Billed annually at ₹{yearlyPrice * 12}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Button onClick={onUpgrade} fullWidth className="h-16 text-lg rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none shadow-[0_10px_40px_rgba(234,179,8,0.3)] hover:shadow-[0_15px_50px_rgba(234,179,8,0.4)] relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Ping Gold <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Button>
          <p className="text-[10px] text-white/30 text-center mt-4 px-8 leading-relaxed">
            Recurring billing, cancel anytime. By tapping "Get Ping Gold", you agree to our Terms of Service.
          </p>
        </div>

      </div>
    </div>
  );
};
