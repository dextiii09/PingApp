
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, Lock, HelpCircle, LogOut, ChevronRight, Moon, Globe, Shield, X, 
  Smartphone, MessageCircle, Crown, Sun, MapPin, Navigation, Eye, EyeOff, 
  Volume2, Vibrate, Wifi, Trash, Instagram, Linkedin, Twitter, Youtube, Sliders,
  Zap, CloudLightning, Activity, Fingerprint, Ghost, Database, CreditCard, Receipt,
  UserX, Mail, AlertTriangle, Loader2
} from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { AnimatePresence, motion } from 'framer-motion';
import { APP_LOGO } from '../constants';
import { User } from '../types';
import { geminiService } from '../services/geminiService';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  onBack: () => void;
  onLogout: () => void;
  onUpgrade?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

// --- UTILITY COMPONENTS ---

const Toggle = ({ active, onToggle, disabled = false }: { active: boolean; onToggle: () => void; disabled?: boolean }) => (
  <button 
    onClick={!disabled ? onToggle : undefined}
    className={`w-11 h-6 rounded-full transition-colors relative ${active ? 'bg-pink-500' : 'bg-gray-300 dark:bg-white/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const RangeSlider = ({ value, min, max, onChange, label, unit }: { value: number, min: number, max: number, onChange: (val: number) => void, label: string, unit: string }) => (
  <div className="space-y-3 py-2">
     <div className="flex justify-between items-center text-sm font-medium text-gray-900 dark:text-white/90">
        <span>{label}</span>
        <span className="text-pink-500">{value}{unit}</span>
     </div>
     <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
     />
  </div>
);

// --- SUB-MODALS ---

const NotificationSettingsModal = ({ onClose, settings, onUpdate }: { onClose: () => void, settings: any, onUpdate: (s: any) => void }) => {
  const toggle = (key: string) => onUpdate({ ...settings, [key]: !settings?.[key] });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
           <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Bell size={18} /> Notifications</h3>
           <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-2">
           {[
             { key: 'matches', label: 'New Matches', desc: 'When you match with a brand' },
             { key: 'messages', label: 'Messages', desc: 'Direct messages and proposals' },
             { key: 'tips', label: 'Tips & Offers', desc: 'Ping Gold discounts and tips' },
             { key: 'email', label: 'Email Digest', desc: 'Weekly summary of stats' },
           ].map((item) => (
             <div key={item.key} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                <div>
                   <p className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</p>
                   <p className="text-xs text-gray-500 dark:text-white/50">{item.desc}</p>
                </div>
                <Toggle active={settings?.[item.key]} onToggle={() => toggle(item.key)} />
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
};

const PaymentModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
    >
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
           <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard size={18} /> Billing</h3>
           <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-6">
           <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={64} /></div>
              <p className="text-xs text-white/60 mb-1">Primary Card</p>
              <p className="font-mono text-lg tracking-wider mb-4">•••• •••• •••• 4242</p>
              <div className="flex justify-between text-xs">
                 <span>VISA</span>
                 <span>EXP 12/25</span>
              </div>
           </div>
           
           <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">History</p>
              {[
                { date: 'Oct 24', label: 'Ping Gold (Monthly)', amount: '$9.99' },
                { date: 'Sep 24', label: 'Ping Gold (Monthly)', amount: '$9.99' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                   <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50">{item.date}</p>
                   </div>
                   <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{item.amount}</span>
                </div>
              ))}
           </div>
           <Button variant="secondary" fullWidth>Update Method</Button>
        </div>
    </motion.div>
  </div>
);

const BlockedUsersModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl h-[50vh] flex flex-col"
    >
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5 shrink-0">
           <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><UserX size={18} /> Blocked Users</h3>
           <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/20" />
                   <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Blocked User {i}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50">Blocked on 12/10/23</p>
                   </div>
                </div>
                <button className="text-xs font-bold text-gray-500 hover:text-red-500 px-3 py-1 bg-white dark:bg-white/10 rounded-full border border-black/5 dark:border-white/10">
                   Unblock
                </button>
             </div>
           ))}
        </div>
    </motion.div>
  </div>
);

const DeleteAccountModal = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#1a1a1a] border border-red-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
    >
       <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
          <p className="text-sm text-gray-500 dark:text-white/60 mb-6 leading-relaxed">
             Are you sure you want to delete your account? This action is permanent and all your data will be removed forever.
          </p>
          <div className="flex gap-3">
             <Button fullWidth variant="secondary" onClick={onClose} className="h-12">No</Button>
             <Button 
               fullWidth 
               onClick={onConfirm} 
               className="bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-600/20 h-12"
             >
               Delete
             </Button>
          </div>
       </div>
    </motion.div>
  </div>
);

const SafetyModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
    >
      <div className="p-6 pb-2 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="text-pink-500" /> Safety Center
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-white"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
          Ping is committed to a safe creator economy.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-3 items-start">
             <Lock className="text-blue-500 dark:text-blue-400 shrink-0" size={18} />
             <div>
               <h4 className="font-bold text-sm text-gray-900 dark:text-white">Secure Payments</h4>
               <p className="text-xs text-gray-500 dark:text-white/50 mt-1">All transactions are held in escrow until deliverables are approved.</p>
             </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-3 items-start">
             <MessageCircle className="text-green-500 dark:text-green-400 shrink-0" size={18} />
             <div>
               <h4 className="font-bold text-sm text-gray-900 dark:text-white">Harassment Policy</h4>
               <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Zero tolerance for abuse. Reports are reviewed 24/7 by human moderators.</p>
             </div>
          </div>
        </div>
        <Button fullWidth onClick={onClose}>Understood</Button>
      </div>
    </motion.div>
  </div>
);

const SupportModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-6 pb-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="text-blue-500" /> Help & Support
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
            Need help? Contact our support team.
          </p>
          <div className="space-y-3">
             <Button variant="secondary" fullWidth onClick={() => alert("Emailing support...")}>Email Support</Button>
             <Button variant="ghost" fullWidth onClick={() => alert("Opening FAQ...")}>View FAQ</Button>
          </div>
        </div>
      </motion.div>
    </div>
);

const PrivacyModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-6 pb-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="text-gray-500" /> Privacy Policy
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 h-64 overflow-y-auto">
          <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
            <strong>1. Data Collection:</strong> We collect information you provide directly to us...
          </p>
          <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
            <strong>2. Use of Information:</strong> We use your information to provide, maintain, and improve our services...
          </p>
          <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">
            <strong>3. Sharing:</strong> We do not share your personal information with third parties except as described...
          </p>
        </div>
        <div className="p-4 border-t border-white/10">
            <Button fullWidth onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onBack, onLogout, onUpgrade, isDarkMode, onToggleTheme }) => {
  const [activeModal, setActiveModal] = useState<'none' | 'safety' | 'notifications' | 'payment' | 'blocked' | 'delete' | 'support' | 'privacy'>('none');

  // Load initial settings from user object or defaults
  const [settings, setSettings] = useState(user?.settings || {
    globalMode: false,
    maxDistance: 50,
    isVisible: true,
    autoplay: true,
    haptics: true,
    onlineStatus: true,
    readReceipts: true,
    dataSaver: false,
    language: 'English',
    notifications: { matches: true, messages: true, tips: false, email: true }
  });

  const [isLocating, setIsLocating] = useState(false);

  // Sync settings back to user profile whenever they change
  useEffect(() => {
    const timer = setTimeout(() => {
        if (onUpdateUser) onUpdateUser({ settings });
    }, 500);
    return () => clearTimeout(timer);
  }, [settings]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const cycleLanguage = () => {
    const langs = ['English', 'Español', 'Français', 'Deutsch', '日本語'];
    const currentLang = settings.language || 'English';
    const idx = langs.indexOf(currentLang);
    const nextLang = langs[(idx + 1) % langs.length];
    updateSetting('language', nextLang);
  };

  const clearCache = () => {
      alert("Cache cleared successfully! App will reload resources on next launch.");
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const locationName = await geminiService.identifyLocation(latitude, longitude);
            if (locationName && locationName !== "Location Unavailable") {
                onUpdateUser({ location: locationName });
                alert(`Location updated to: ${locationName}`);
            } else {
                alert("Could not identify specific city. Please try manually.");
            }
        } catch (e) {
            console.error("Location error", e);
            alert("Location service unavailable.");
        }
        setIsLocating(false);
    }, (error) => {
        alert("Unable to retrieve location. Please enable permissions.");
        setIsLocating(false);
    });
  };

  const handleConnect = (platform: string) => {
      const handle = window.prompt(`Enter your ${platform} username:`);
      if (handle && user) {
          onUpdateUser({
              socials: {
                  ...(user.socials || {}),
                  [platform.toLowerCase()]: handle
              }
          });
      }
  };

  const handleDisconnect = (platform: string) => {
      if(window.confirm(`Disconnect ${platform}?`) && user) {
          onUpdateUser({
              socials: {
                  ...(user.socials || {}),
                  [platform.toLowerCase()]: ""
              }
          });
      }
  };

  if (!user) return null;

  return (
    <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-300 relative text-gray-900 dark:text-white bg-white dark:bg-[#050505]">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-white/80 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
           <img src={APP_LOGO} className="w-8 h-8 rounded-lg shadow-sm" alt="Ping Logo" />
           <h2 className="text-2xl font-bold">Settings</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pb-24 no-scrollbar">
        
        {/* PREMIUM BANNER */}
        <div 
          onClick={onUpgrade}
          className="relative overflow-hidden rounded-2xl p-0.5 cursor-pointer group"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-gradient-x opacity-100"></div>
           <div className="relative bg-white dark:bg-[#1a1a1a] rounded-[14px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-black shadow-lg">
                    <Crown size={20} fill="black" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Ping Gold</h3>
                    <p className="text-xs text-gray-500 dark:text-white/60">Unlock all features</p>
                 </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
           </div>
        </div>

        {/* SECTION: DISCOVERY */}
        <div className="space-y-3">
           <h3 className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-2 flex items-center gap-2">
             <Navigation size={12} /> Discovery Settings
           </h3>
           <GlassCard className="p-0 overflow-hidden" intensity="low">
              {/* Location */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><MapPin size={18} /></div>
                   <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">Current Location</span>
                      <span className="text-xs text-gray-500 dark:text-white/50 block">{user.location || 'Unknown'}</span>
                   </div>
                 </div>
                 <Button variant="ghost" className="h-8 text-xs text-blue-500" onClick={handleUpdateLocation}>
                    {isLocating ? <Loader2 size={14} className="animate-spin" /> : 'Update'}
                 </Button>
              </div>

              {/* Global Mode */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-purple-500/10 text-purple-500"><Globe size={18} /></div>
                   <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">Global Mode</span>
                      <span className="text-xs text-gray-500 dark:text-white/50 block">Match with anyone, anywhere</span>
                   </div>
                 </div>
                 <Toggle active={settings.globalMode} onToggle={() => updateSetting('globalMode', !settings.globalMode)} />
              </div>

              {/* Distance Slider */}
              {!settings.globalMode && (
                 <div className="w-full p-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <RangeSlider 
                       label="Maximum Distance" 
                       value={settings.maxDistance} 
                       min={5} 
                       max={150} 
                       unit="km" 
                       onChange={(val) => updateSetting('maxDistance', val)} 
                    />
                 </div>
              )}

              {/* Visibility */}
              <div className="w-full flex items-center justify-between p-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-pink-500/10 text-pink-500"><Eye size={18} /></div>
                   <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">Show me on Ping</span>
                      <span className="text-xs text-gray-500 dark:text-white/50 block">Turn off to pause account</span>
                   </div>
                 </div>
                 <Toggle active={settings.isVisible} onToggle={() => updateSetting('isVisible', !settings.isVisible)} />
              </div>
           </GlassCard>
        </div>

        {/* SECTION: BILLING */}
        <div className="space-y-3">
           <h3 className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-2 flex items-center gap-2">
             <CreditCard size={12} /> Payment & Billing
           </h3>
           <GlassCard className="p-0 overflow-hidden" intensity="low">
             <button onClick={() => setActiveModal('payment')} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5 group">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-green-500/10 text-green-500"><CreditCard size={18} /></div>
                   <span className="text-sm font-medium text-gray-900 dark:text-white/90">Payment Methods</span>
                 </div>
                 <ChevronRight size={16} className="text-gray-300 dark:text-white/20" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-gray-500/10 text-gray-500"><Receipt size={18} /></div>
                   <span className="text-sm font-medium text-gray-900 dark:text-white/90">Restore Purchases</span>
                 </div>
              </button>
           </GlassCard>
        </div>

        {/* SECTION: APP EXPERIENCE */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-2 flex items-center gap-2">
             <Smartphone size={12} /> App Experience
          </h3>
          <GlassCard className="p-0 overflow-hidden" intensity="low">
            
            {/* Dark Mode */}
            <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500">
                   {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                 </div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Dark Mode</span>
               </div>
               <Toggle active={isDarkMode} onToggle={onToggleTheme} />
            </div>

            {/* Haptics */}
            <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-orange-500/10 text-orange-500"><Vibrate size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Haptic Feedback</span>
               </div>
               <Toggle active={settings.haptics} onToggle={() => updateSetting('haptics', !settings.haptics)} />
            </div>

            {/* Autoplay */}
            <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-red-500/10 text-red-500"><Volume2 size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Autoplay Videos</span>
               </div>
               <Toggle active={settings.autoplay} onToggle={() => updateSetting('autoplay', !settings.autoplay)} />
            </div>

            {/* Notifications */}
            <button onClick={() => setActiveModal('notifications')} className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-green-500/10 text-green-500"><Bell size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Notifications</span>
               </div>
               <ChevronRight size={16} className="text-gray-300 dark:text-white/20" />
            </button>

            {/* Language */}
            <button onClick={cycleLanguage} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-teal-500/10 text-teal-500"><Globe size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Language</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-500 dark:text-white/40">{settings.language || 'English'}</span>
                 <ChevronRight size={16} className="text-gray-300 dark:text-white/20" />
               </div>
            </button>
          </GlassCard>
        </div>

        {/* SECTION: CONNECTED ACCOUNTS */}
        <div className="space-y-3">
           <h3 className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-2 flex items-center gap-2">
             <Activity size={12} /> Integrations
           </h3>
           <GlassCard className="p-0 overflow-hidden" intensity="low">
              {/* Instagram */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white"><Instagram size={18} /></div>
                   <div>
                     <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">Instagram</span>
                     {user.socials?.instagram ? (
                        <span className="text-xs text-green-500 font-medium block">Connected as {user.socials.instagram}</span>
                     ) : (
                        <span className="text-xs text-gray-500 dark:text-white/50 block">Not Connected</span>
                     )}
                   </div>
                 </div>
                 {user.socials?.instagram ? (
                    <button className="text-xs text-gray-400 hover:text-red-500" onClick={() => handleDisconnect('Instagram')}>Disconnect</button>
                 ) : (
                    <Button variant="secondary" className="h-7 text-xs px-3" onClick={() => handleConnect('Instagram')}>Connect</Button>
                 )}
              </div>

              {/* Twitter */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center"><Twitter size={18} /></div>
                   <div>
                     <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">X (Twitter)</span>
                     {user.socials?.twitter ? (
                        <span className="text-xs text-green-500 font-medium block">Connected as {user.socials.twitter}</span>
                     ) : (
                        <span className="text-xs text-gray-500 dark:text-white/50 block">Not Connected</span>
                     )}
                   </div>
                 </div>
                 {user.socials?.twitter ? (
                    <button className="text-xs text-gray-400 hover:text-red-500" onClick={() => handleDisconnect('Twitter')}>Disconnect</button>
                 ) : (
                    <Button variant="secondary" className="h-7 text-xs px-3" onClick={() => handleConnect('Twitter')}>Connect</Button>
                 )}
              </div>

              {/* LinkedIn */}
              <div className="w-full flex items-center justify-between p-4">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-full bg-[#0077b5] text-white flex items-center justify-center"><Linkedin size={18} /></div>
                   <div>
                     <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">LinkedIn</span>
                     {user.socials?.linkedin ? (
                        <span className="text-xs text-green-500 font-medium block">Connected as {user.socials.linkedin}</span>
                     ) : (
                        <span className="text-xs text-gray-500 dark:text-white/50 block">Not Connected</span>
                     )}
                   </div>
                 </div>
                 {user.socials?.linkedin ? (
                    <button className="text-xs text-gray-400 hover:text-red-500" onClick={() => handleDisconnect('LinkedIn')}>Disconnect</button>
                 ) : (
                    <Button variant="secondary" className="h-7 text-xs px-3" onClick={() => handleConnect('LinkedIn')}>Connect</Button>
                 )}
              </div>
           </GlassCard>
        </div>

        {/* SECTION: PRIVACY & DATA */}
        <div className="space-y-3">
           <h3 className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-2 flex items-center gap-2">
             <Fingerprint size={12} /> Privacy & Data
           </h3>
           <GlassCard className="p-0 overflow-hidden" intensity="low">
              {/* Online Status */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-green-500/10 text-green-500"><Activity size={18} /></div>
                   <span className="text-sm font-medium text-gray-900 dark:text-white/90">Online Status</span>
                 </div>
                 <Toggle active={settings.onlineStatus} onToggle={() => updateSetting('onlineStatus', !settings.onlineStatus)} />
              </div>

              {/* Blocked Users */}
              <button onClick={() => setActiveModal('blocked')} className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-red-500/10 text-red-500"><UserX size={18} /></div>
                   <span className="text-sm font-medium text-gray-900 dark:text-white/90">Blocked Users</span>
                 </div>
                 <ChevronRight size={16} className="text-gray-300 dark:text-white/20" />
              </button>

              {/* Read Receipts */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Eye size={18} /></div>
                   <span className="text-sm font-medium text-gray-900 dark:text-white/90">Read Receipts</span>
                 </div>
                 <Toggle active={settings.readReceipts} onToggle={() => updateSetting('readReceipts', !settings.readReceipts)} />
              </div>

              {/* Data Saver */}
              <div className="w-full flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500"><CloudLightning size={18} /></div>
                   <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white/90 block">Data Saver</span>
                      <span className="text-xs text-gray-500 dark:text-white/50 block">Lower quality media</span>
                   </div>
                 </div>
                 <Toggle active={settings.dataSaver} onToggle={() => updateSetting('dataSaver', !settings.dataSaver)} />
              </div>

              {/* Clear Cache */}
              <button onClick={clearCache} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-full bg-gray-500/10 text-gray-500"><Trash size={18} /></div>
                   <span className="text-sm font-medium text-gray-900 dark:text-white/90">Clear Cache</span>
                 </div>
                 <span className="text-xs text-gray-400">128 MB</span>
              </button>
           </GlassCard>
        </div>

        {/* SECTION: SUPPORT */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-2 flex items-center gap-2">
             <HelpCircle size={12} /> Support
          </h3>
          <GlassCard className="p-0 overflow-hidden" intensity="low">
            <button onClick={() => setActiveModal('safety')} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5 group">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-red-500/10 text-red-500"><Shield size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Safety Center</span>
               </div>
               <ChevronRight size={16} className="text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/40" />
            </button>

            <button onClick={() => setActiveModal('support')} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5 group">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><HelpCircle size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Help & Support</span>
               </div>
               <ChevronRight size={16} className="text-gray-300 dark:text-white/20" />
            </button>

            <button onClick={() => setActiveModal('privacy')} className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-gray-500/10 text-gray-500"><Lock size={18} /></div>
                 <span className="text-sm font-medium text-gray-900 dark:text-white/90">Privacy Policy</span>
               </div>
               <ChevronRight size={16} className="text-gray-300 dark:text-white/20" />
            </button>
          </GlassCard>
        </div>
        
        <div className="pt-6 pb-4 space-y-4">
          <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10 h-14 border border-red-500/10" onClick={onLogout}>
            <LogOut size={20} className="mr-2" /> Sign Out
          </Button>
          
          <button 
             onClick={() => setActiveModal('delete')}
             className="w-full text-xs text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
          >
             Delete Account
          </button>

          <div className="text-center mt-6 space-y-1">
             <p className="text-[10px] text-gray-400 dark:text-white/20 font-medium font-mono">PING v2.1.0 (PROD)</p>
             <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 dark:text-white/10">
                <span>Made in SF</span>
                <span>•</span>
                <span>Reachup Media</span>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === 'safety' && <SafetyModal onClose={() => setActiveModal('none')} />}
        {activeModal === 'notifications' && <NotificationSettingsModal settings={settings.notifications} onUpdate={(n) => updateSetting('notifications', n)} onClose={() => setActiveModal('none')} />}
        {activeModal === 'payment' && <PaymentModal onClose={() => setActiveModal('none')} />}
        {activeModal === 'blocked' && <BlockedUsersModal onClose={() => setActiveModal('none')} />}
        {activeModal === 'delete' && <DeleteAccountModal onClose={() => setActiveModal('none')} onConfirm={onLogout} />}
        {activeModal === 'support' && <SupportModal onClose={() => setActiveModal('none')} />}
        {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal('none')} />}
      </AnimatePresence>
    </div>
  );
};
