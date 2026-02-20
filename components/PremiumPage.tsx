
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole } from '../types';
import { Check, X, Star, Zap, Eye, Shield, Crown, ChevronLeft, Sparkles, Filter, MessageCircle, Layers, Infinity, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface PremiumPageProps {
  user: User;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ user, onClose, onUpgrade }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const isCreator = user.role === UserRole.INFLUENCER;
  
  // Pricing Configuration
  const PRICE_MONTHLY = 499; // ₹499 or $9.99 equivalent
  const PRICE_YEARLY = 4790; // ₹4790 (approx 20% off)

  const benefits = isCreator ? [
    { icon: Eye, label: "See Who Liked You", desc: "Reveal blurred cards. +300% Match rate." },
    { icon: Infinity, label: "Unlimited Swipes", desc: "No daily caps. Swipe as much as you want." },
    { icon: Star, label: "Profile Boost", desc: "Be the top card in Brands' stacks for 30 mins/week." },
    { icon: CheckCircle2, label: "Read Receipts", desc: "Know when brands open your messages." }
  ] : [
    { icon: Filter, label: "Advanced Filters", desc: "Filter by engagement rate, location & niche." },
    { icon: MessageCircle, label: "Direct Message", desc: "Message creators before matching (3/day)." },
    { icon: Layers, label: "Bulk Actions", desc: "\"Super Like\" 5 creators at once." },
    { icon: Shield, label: "Verified Badge", desc: "Instant green tick & priority support." }
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);

    try {
      // ATTEMPT NATIVE GOOGLE PAY / BROWSER PAYMENT
      if (window.PaymentRequest) {
        const supportedInstruments = [{
          supportedMethods: 'https://google.com/pay',
          data: {
            environment: 'TEST',
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
              merchantName: 'Ping App Inc.',
              merchantId: 'TEST' // Replace with your real Merchant ID in production
            },
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                  'gateway': 'example', // Replace with 'stripe' or 'braintree'
                  'gatewayMerchantId': 'exampleGatewayMerchantId' // Replace with your Gateway Key
                }
              }
            }]
          }
        }];

        const price = billingCycle === 'monthly' ? PRICE_MONTHLY : PRICE_YEARLY;
        
        const details = {
          total: {
            label: `Ping Gold (${billingCycle})`,
            amount: { currency: 'INR', value: price.toString() }
          }
        };

        try {
          const request = new PaymentRequest(supportedInstruments, details);
          const response = await request.show();
          // In a real app, send response.details to your backend here
          await response.complete('success');
          await onUpgrade();
        } catch (err) {
          // User cancelled or API error
          console.warn("Payment Request cancelled or failed:", err);
          // If native pay fails or is cancelled, we stop processing
          setIsProcessing(false);
          return;
        }
      } else {
        // FALLBACK SIMULATION (For browsers without PaymentRequest)
        await new Promise(resolve => setTimeout(resolve, 2000));
        await onUpgrade();
      }
    } catch (e) {
      console.error("Payment Error:", e);
    }

    setIsProcessing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-black text-white flex flex-col h-[100dvh] overflow-y-auto no-scrollbar"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
         <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={24} />
         </button>
         <div className="text-center">
            <h1 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 tracking-wide flex items-center justify-center gap-2">
               PING GOLD <Crown size={16} className="text-yellow-400 fill-yellow-400" />
            </h1>
         </div>
         <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Hero Section - Increased padding-top to ensure "Stop waiting" is visible */}
      <div className="p-6 pt-32 text-center relative overflow-hidden shrink-0">
         {/* Gold Ambient Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none"></div>

         <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="relative z-10"
         >
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight whitespace-pre-line drop-shadow-lg">
               {isCreator ? "Stop waiting.\nStart landing deals." : "Scale your campaign\nin minutes."}
            </h2>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
               Unlock the full experience and join 5,000+ Gold members closing deals faster.
            </p>
         </motion.div>
      </div>

      {/* Pricing Toggle */}
      <div className="px-6 mb-10 shrink-0">
         <div className="bg-white/5 p-1 rounded-2xl flex relative max-w-sm mx-auto border border-white/10">
            <motion.div 
              className="absolute top-1 bottom-1 bg-white/10 rounded-xl shadow-lg border border-white/10"
              initial={false}
              animate={{ 
                 left: billingCycle === 'monthly' ? '4px' : '50%', 
                 width: 'calc(50% - 4px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-3 text-sm font-bold relative z-10 transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}
            >
               Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-3 text-sm font-bold relative z-10 transition-colors flex flex-col items-center justify-center leading-none ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40'}`}
            >
               <span>Yearly</span>
               <span className="text-[9px] text-green-400 mt-1 uppercase tracking-widest font-extrabold">Save 20%</span>
            </button>
         </div>
      </div>

      {/* Plan Cards */}
      <div className="px-6 pb-32 space-y-6 max-w-lg mx-auto w-full">
         
         {/* Free Plan (Comparison) */}
         <div className="p-6 rounded-3xl bg-white/5 border border-white/5 grayscale opacity-70">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-lg font-bold text-white">Free Plan</h3>
                  <p className="text-white/40 text-xs">Standard access</p>
               </div>
               <span className="text-xl font-bold text-white/50">₹0</span>
            </div>
            <ul className="space-y-3">
               <li className="flex items-center gap-3 text-sm text-white/60"><Check size={16} /> Basic Swiping</li>
               <li className="flex items-center gap-3 text-sm text-white/60"><Check size={16} /> Standard Visibility</li>
               <li className="flex items-center gap-3 text-sm text-white/60"><Check size={16} /> Community Support</li>
            </ul>
            <button disabled className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/5 text-white/30 font-bold text-sm cursor-not-allowed">
               Current Plan
            </button>
         </div>

         {/* GOLD Plan (Focus) */}
         <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 rounded-[26px] opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#1a1500] to-black border border-yellow-500/30 shadow-2xl">
               
               <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-2xl">
                  MOST POPULAR
               </div>

               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        Gold <Crown size={20} className="fill-yellow-400 text-yellow-400" />
                     </h3>
                     <p className="text-yellow-500/60 text-xs font-mono uppercase tracking-widest mt-1">Everything in Free +</p>
                  </div>
                  <div className="text-right">
                     <span className="text-3xl font-bold text-white">
                        ₹{billingCycle === 'monthly' ? PRICE_MONTHLY : Math.round(PRICE_YEARLY/12)}
                     </span>
                     <span className="text-white/40 text-xs block">/month</span>
                     {billingCycle === 'yearly' && <span className="text-green-400 text-[10px] block mt-1">Billed ₹{PRICE_YEARLY} yearly</span>}
                  </div>
               </div>

               <ul className="space-y-4 mb-8">
                  {benefits.map((benefit, i) => (
                     <li key={i} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 text-black shrink-0 mt-0.5">
                           <benefit.icon size={12} strokeWidth={3} />
                        </div>
                        <div>
                           <span className="text-sm font-bold text-white block">{benefit.label}</span>
                           <span className="text-xs text-white/50">{benefit.desc}</span>
                        </div>
                     </li>
                  ))}
               </ul>

               <Button 
                 fullWidth 
                 onClick={handleSubscribe}
                 disabled={isProcessing}
                 className="h-14 bg-black hover:bg-gray-900 text-white border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] font-bold text-lg tracking-wide relative overflow-hidden"
               >
                  {isProcessing ? (
                     <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                     </span>
                  ) : (
                     <div className="flex items-center gap-2 justify-center w-full">
                        <span className="text-white/90 text-base font-medium mr-1">Pay with</span>
                        <span className="font-bold text-white text-xl">G</span>
                        <span className="font-bold text-white text-xl -ml-0.5">Pay</span>
                     </div>
                  )}
               </Button>
               
               <p className="text-center text-[10px] text-white/30 mt-4">
                  Secure payment via Google Pay. Cancel anytime.
               </p>
            </div>
         </div>

      </div>
    </motion.div>
  );
};
