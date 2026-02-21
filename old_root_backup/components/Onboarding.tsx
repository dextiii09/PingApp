
import React, { useState, useRef } from 'react';
import { UserRole } from '../types';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { ArrowRight, Camera, Sparkles, ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_LOGO } from '../constants'; // Import APP_LOGO

interface OnboardingProps {
  role: UserRole;
  onComplete: () => void;
  onBack: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ role, onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interests State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInterest, setOtherInterest] = useState('');

  const title = role === UserRole.BUSINESS ? "Setup your Brand" : "Build your Profile";
  const subtitle = role === UserRole.BUSINESS ? "Find the perfect voice for your product." : "Let brands discover your talent.";

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!email.trim()) {
         setEmailError('Email is required');
         return;
      }
      if (!validateEmail(email)) {
         setEmailError('Please enter a valid email address');
         return;
      }
      setStep(2);
    } else {
      // In a real app, we would gather selectedInterests and otherInterest here
      onComplete();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedInterests(prev => [...prev, tag]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="h-full flex flex-col items-center justify-center p-6 relative overflow-y-auto"
    >
       <button 
          onClick={onBack} 
          className="absolute top-6 left-6 p-2 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors z-20"
       >
          <ArrowLeft size={24} />
       </button>

       <GlassCard className="w-full max-w-md p-8 relative overflow-hidden my-auto">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-white/10">
             <motion.div 
               className="h-full bg-gradient-to-r from-pink-500 to-orange-400"
               initial={{ width: "0%" }}
               animate={{ width: step === 1 ? "50%" : "100%" }}
             />
          </div>

          <div className="text-center mb-8 mt-4">
             <div className="mb-6 flex justify-center">
                 <img src={APP_LOGO} alt="Ping" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
             </div>
             <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h2>
             <p className="text-gray-600 dark:text-white/60 text-sm">{subtitle}</p>
          </div>

          <div className="space-y-6">
             {step === 1 ? (
                <div className="space-y-4">
                   <div className="flex justify-center">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <div 
                        onClick={triggerFileInput}
                        className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors group relative overflow-hidden"
                      >
                         {avatarPreview ? (
                           <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                         ) : (
                           <>
                             <Camera size={24} className="text-gray-400 dark:text-white/40 group-hover:text-gray-600 dark:group-hover:text-white transition-colors relative z-10" />
                             <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           </>
                         )}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest ml-1">Display Name</label>
                      <input type="text" placeholder={role === UserRole.BUSINESS ? "Brand Name" : "Your Name"} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => {
                           setEmail(e.target.value);
                           if (emailError) setEmailError('');
                        }}
                        placeholder="you@example.com" 
                        className={`w-full bg-gray-50 dark:bg-black/20 border rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30 ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-white/10 focus:border-pink-500/50'}`} 
                      />
                      {emailError && <p className="text-xs text-red-500 font-medium ml-1">{emailError}</p>}
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest ml-1">Location</label>
                      <input type="text" placeholder="e.g. New York, NY" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30" />
                   </div>
                </div>
             ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest ml-1">Select Interests (Multiple)</label>
                      <div className="flex flex-wrap gap-2">
                         {['Tech', 'Fashion', 'Fitness', 'Travel', 'Food', 'Gaming', 'Art', 'Music'].map(tag => (
                            <button 
                              key={tag} 
                              onClick={() => toggleInterest(tag)}
                              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                                selectedInterests.includes(tag) 
                                  ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20' 
                                  : 'bg-white/40 dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-200 text-gray-600 dark:text-white/80'
                              }`}
                            >
                               {tag}
                            </button>
                         ))}
                         <button 
                            onClick={() => setShowOtherInput(!showOtherInput)}
                            className={`px-3 py-1.5 rounded-full border text-sm transition-all flex items-center gap-1 ${
                                showOtherInput || (otherInterest && selectedInterests.includes(otherInterest)) // Visual cue if 'Other' is active or used
                                  ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                                  : 'bg-white/40 dark:bg-white/5 border-gray-300 dark:border-white/10 hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-200 text-gray-600 dark:text-white/80'
                            }`}
                         >
                            <Plus size={14} /> Other
                         </button>
                      </div>

                      <AnimatePresence>
                        {showOtherInput && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-2 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest ml-1">Other Interest</label>
                                    <input 
                                        type="text" 
                                        value={otherInterest}
                                        onChange={(e) => setOtherInterest(e.target.value)}
                                        placeholder="Type your interest here..."
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30 text-sm"
                                    />
                                </div>
                            </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                   <div className="space-y-2 mt-4">
                      <label className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest ml-1">Bio</label>
                      <textarea placeholder="Write a short bio..." className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 h-24 resize-none transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30" />
                   </div>
                </div>
             )}
          </div>

          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
             <Button fullWidth onClick={handleNext}>
                {step === 1 ? "Next Step" : "Get Started"} {step === 1 && <ArrowRight size={16} className="ml-2" />}
             </Button>
          </div>
       </GlassCard>
    </motion.div>
  );
};
