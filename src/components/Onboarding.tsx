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
          {step === 2 && "What are your goals?"}
          {step === 3 && "Add your portfolio"}
        </h1>
        <p className="text-gray-500 mb-8">
          {step === 1 && "Tell us a bit about yourself so we can find the best matches."}
          {step === 2 && "Select the types of collaborations you're interested in."}
          {step === 3 && "Showcase your best work to attract potential partners."}
        </p>

        {/* Placeholder content for steps */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex items-center justify-center h-64">
          <p className="text-gray-400 font-medium">Step {step} Content Placeholder</p>
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
