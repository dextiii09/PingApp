import React, { useState } from 'react';
import { UserRole } from '../types';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  role: UserRole;
  onBack: () => void;
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ role, onBack, onComplete }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2">
          {step === 1 && "Let's get to know you"}
          {step === 2 && "Where are you based?"}
          {step === 3 && "Tell us your story"}
        </h1>
        <p className="text-gray-500 mb-8">
          {step === 1 && "Start with the basics."}
          {step === 2 && "Help us find partners near you."}
          {step === 3 && "A great bio helps you stand out."}
        </p>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pixel Arcade"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Your Role</label>
                <div className="p-4 bg-black text-white rounded-2xl font-bold flex items-center justify-between">
                  {role === UserRole.BUSINESS ? 'Brand / Business' : 'Content Creator'}
                  <ChevronRight size={18} className="opacity-40" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Short Bio</label>
                <textarea
                  rows={4}
                  placeholder="Describe what you do in a few sentences..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={handleNext} fullWidth className="bg-black text-white h-14 rounded-xl font-bold shadow-lg shadow-black/10">
          {step === 3 ? "Complete Profile" : "Continue"} <ChevronRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
