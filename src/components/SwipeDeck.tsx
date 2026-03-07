
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';
import { X, Heart, Star, MapPin, SlidersHorizontal, Search, Zap, RotateCcw, PlayCircle, ChevronDown, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate as animateValue } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { ProfileCard } from './ProfileCard';

interface SwipeDeckProps {
  candidates: User[];
  currentUserRole?: UserRole;
  isPremium?: boolean;
  isLoading?: boolean;
  dailySwipeCount?: number;
  onSwipeCountChange?: (count: number) => void;
  onUpgrade?: () => void;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: string) => Promise<{ isMatch: boolean } | void>;
  onMatchChat?: (user: User) => void;
}

// Interface for programmatic control of the card
export interface SwipeCardHandle {
  triggerSwipe: (direction: 'left' | 'right' | 'up') => Promise<void>;
}

// --- UTILS ---

const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore errors on devices that don't support vibration or block it
    }
  }
};

// --- SUB-COMPONENTS ---

const SkeletonCard = () => (
  <div className="w-full h-full bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 relative">
    {/* Shimmer Gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

    {/* Image Placeholder */}
    <div className="h-[70%] bg-white/5 w-full relative">
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="w-8 h-8 rounded-full bg-white/10" />
      </div>
    </div>

    {/* Content Placeholder */}
    <div className="absolute bottom-0 w-full p-6 space-y-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
      <div className="space-y-2">
        <div className="h-8 w-2/3 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-4 w-1/3 bg-white/10 rounded-lg animate-pulse" />
      </div>

      <div className="flex gap-2">
        <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse" />
      </div>

      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-3 pb-10">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        <div className="absolute bottom-3 left-3 right-3 space-y-2">
          <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { location: string; niche: string }) => void;
  currentFilters: { location: string; niche: string };
}> = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [loc, setLoc] = useState(currentFilters.location);
  const [niche, setNiche] = useState(currentFilters.niche);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoc(currentFilters.location);
      setNiche(currentFilters.niche);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-sm mt-auto sm:mt-0 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl bg-black/80 backdrop-blur-2xl border border-white/10 relative z-[250]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />
        <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
          <h3 className="font-bold text-white flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-pink-500" /> Filter Deck
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="e.g. New York, Remote"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Niche / Tag</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Fitness, Tech, Fashion"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setLoc('');
              setNiche('');
              onApply({ location: '', niche: '' });
              onClose();
            }}
          >
            Clear
          </Button>
          <Button
            fullWidth
            onClick={() => {
              onApply({ location: loc, niche });
              onClose();
            }}
          >
            Apply Filters
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const MatchOverlay: React.FC<{ candidate: User; isPremium?: boolean; onUpgrade?: () => void; onClose: () => void; onChat: () => void }> = ({ candidate, isPremium, onUpgrade, onClose, onChat }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-6"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 text-center space-y-6 relative z-10 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/10"
    >
      <div className="text-blue-500 font-bold tracking-[0.2em] text-sm uppercase">NEW CONNECTION</div>

      <div className="flex items-center justify-center gap-0">
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1a1a1a] relative overflow-hidden shadow-lg z-10 translate-x-3">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="user" />
        </div>
        <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#1a1a1a] relative overflow-hidden shadow-xl z-20">
          <img src={candidate.avatar} className="w-full h-full object-cover" alt="match" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{candidate.name}</h2>
        {candidate.aiMatchReason ? (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 mt-4 relative overflow-hidden">
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5"><Sparkles size={12} /> AI Insight</p>
            {isPremium ? (
              <p className="text-gray-700 dark:text-white/90 text-sm font-medium leading-relaxed">{candidate.aiMatchReason}</p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-gray-400 dark:text-white/40 text-sm font-medium leading-relaxed blur-[4px] select-none pointer-events-none">
                  This is a highly personalized reason explaining why you two are a perfect match based on deep data analysis.
                </p>
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px]">
                  <button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-transform hover:scale-105">
                    <Lock size={14} /> Unlock Insight
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium">A potential collaboration awaits.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full pt-2">
        <Button fullWidth onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); onChat(); }} className="py-3 shadow-md">
          Message Now
        </Button>
        <button onClick={onClose} className="w-full py-3 text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-xs tracking-wider uppercase transition-colors">
          Keep Exploring
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const ProfileDetailModal: React.FC<{
  user: User;
  onClose: () => void;
  onAction: (direction: 'left' | 'right' | 'up') => void;
  role?: UserRole;
  isPremium?: boolean;
}> = ({ user, onClose, onAction, role, isPremium }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 50 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 50 }}
    className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col"
  >
    {/* Header */}
    <div className="p-4 flex justify-between items-center shrink-0">
      <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
        <ChevronDown size={24} />
      </button>
      <span className="font-bold text-white text-sm tracking-widest uppercase">Profile Detail</span>
      <div className="w-10"></div>
    </div>

    {/* Content */}
    <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col justify-center">
      <div className="w-full max-w-lg mx-auto h-full max-h-[75vh] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <ProfileCard user={user} role={role} isPremium={isPremium} expanded={true} />
      </div>
    </div>

    {/* Actions */}
    <div className="p-6 pb-8 flex justify-center items-center gap-6 shrink-0">
      <ActionButton
        icon={<X size={32} />}
        color="text-red-500"
        bg="bg-black/80 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
        size="large"
        onClick={() => { onAction('left'); onClose(); }}
      />
      <ActionButton
        icon={<Star size={24} fill="currentColor" />}
        color="text-blue-400"
        bg="bg-black/80 border-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.3)]"
        onClick={() => { onAction('up'); onClose(); }}
      />
      <ActionButton
        icon={<Heart size={32} fill="currentColor" />}
        color="text-green-500"
        bg="bg-black/80 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
        size="large"
        onClick={() => { onAction('right'); onClose(); }}
      />
    </div>
  </motion.div>
);

const GridItemCard: React.FC<{ user: User; onClick: () => void }> = ({ user, onClick }) => {
  return (
    <motion.div
      layoutId={`card-${user.id}`}
      onClick={onClick}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group border border-transparent hover:border-pink-500/50 transition-all"
      whileHover={{ scale: 0.98 }}
    >
      <img src={user.avatar} className="w-full h-full object-cover" loading="lazy" alt={user.name} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

      {/* Mini Badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {user.aiMatchScore && (
          <div className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {user.aiMatchScore}%
          </div>
        )}
        {user.introVideoUrl && (
          <div className="bg-white/20 backdrop-blur-sm text-white p-1 rounded-full flex items-center justify-center">
            <PlayCircle size={10} fill="currentColor" />
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white">
        <h3 className="font-bold text-sm truncate">{user.name}</h3>
        <div className="flex items-center gap-1 text-[10px] text-white/70">
          <MapPin size={10} /> {user.location?.split(',')[0]}
        </div>
        {/* Quick Tags */}
        <div className="flex gap-1 mt-1.5">
          {user.tags.slice(0, 1).map(t => (
            <span key={t} className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm truncate">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const RadarScan = ({ filtersActive, dislikedCount, onRewindDisliked }: { filtersActive: boolean, dislikedCount: number, onRewindDisliked: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full relative w-full pb-32">
    <div className="absolute w-64 h-64 border border-pink-500/20 rounded-full animate-ping opacity-20" />
    <div className="absolute w-48 h-48 border border-pink-500/30 rounded-full animate-ping opacity-30 animation-delay-500" />

    <div className="relative w-24 h-24 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_50px_rgba(236,72,153,0.2)]">
      <div className="absolute inset-0 rounded-full border-t-2 border-pink-500 animate-spin"></div>
    </div>

    <h3 className="mt-8 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
      {filtersActive ? 'No Matches Found' : 'All Caught Up'}
    </h3>
    <p className="text-gray-500 dark:text-white/40 text-sm mt-2 text-center max-w-xs">
      {filtersActive ? 'Try adjusting your filters.' : 'Check back later for more.'}
    </p>

    {dislikedCount > 0 && !filtersActive && (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onRewindDisliked}
        className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full backdrop-blur-md flex items-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <RotateCcw size={18} className="text-yellow-400" />
        Rewind {dislikedCount} Disliked Profile{dislikedCount !== 1 ? 's' : ''}
      </motion.button>
    )}
  </div>
);

// --- MAIN COMPONENT ---

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  candidates,
  currentUserRole,
  isPremium,
  isLoading,
  dailySwipeCount = 0,
  onSwipeCountChange,
  swipeHistory,
  onSwipeHistoryChange,
  onUpgrade,
  onSwipe,
  onMatchChat
}) => {
  const [matchData, setMatchData] = useState<User | null>(null);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [lastSwipeDir, setLastSwipeDir] = useState<'left' | 'right' | 'up'>('left');

  // View Modes
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [selectedGridUser, setSelectedGridUser] = useState<User | null>(null);

  // Filtering State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ location: '', niche: '' });

  // No longer using a ref since AnimatePresence + exit handles it visually
  // const activeCardRef = useRef<SwipeCardHandle>(null);

  // MEMOIZED STACK COMPUTATION (Replaces state synchronization)
  const stack = useMemo(() => {
    // 1. Filter out swiped users
    const swipedIds = new Set(swipeHistory.map(h => h.user.id));
    let filtered = candidates.filter(c => !swipedIds.has(c.id));

    // 2. Apply Search Filters
    if (filters.location) {
      const locTerm = filters.location.toLowerCase();
      filtered = filtered.filter(c =>
        c.location && c.location.toLowerCase().includes(locTerm)
      );
    }

    if (filters.niche) {
      const nicheTerm = filters.niche.toLowerCase();
      filtered = filtered.filter(c =>
        c.tags.some(tag => tag.toLowerCase().includes(nicheTerm)) ||
        (c.bio && c.bio.toLowerCase().includes(nicheTerm))
      );
    }

    // 3. Apply Boost Sorting (if active)
    if (isBoostActive) {
      // Shallow copy before sort to avoid mutating props
      filtered = [...filtered].sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
    }

    return filtered;
  }, [candidates, swipeHistory, filters, isBoostActive]);

  // Derived Values for handlers
  const activeIndex = 0;
  const activeCard = stack[activeIndex];
  const nextIndex = 1;
  const nextCard = stack[nextIndex];
  const hasActiveFilters = !!(filters.location || filters.niche);
  const dislikedCount = swipeHistory.filter(h => h.direction === 'left').length;

  const handleSwipeResult = async (direction: 'left' | 'right' | 'up', user: User) => {
    console.log(`handleSwipeResult triggered for ${user.name} in direction: ${direction}`);
    // 1. Set exit direction first so the exiting card has it
    setLastSwipeDir(direction);

    // 2. Add to history IMMEDIATELY -> Triggers re-render via useMemo to remove from stack
    onSwipeHistoryChange(prev => [...prev, { user, direction }]);

    // 2. Visual & Haptic Feedback
    if (direction === 'up') {
      triggerHaptic([30, 20, 30]);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#FFFFFF'],
        shapes: ['star'],
        zIndex: 100
      });
    } else {
      triggerHaptic(10);
    }

    try {
      // 3. Notify parent/API in background
      const result = await onSwipe(direction, user.id);

      // 4. Check for match
      if (result && result.isMatch) {
        // If there is an AI Match Reason generated, merge it into the temporary user object to display in the modal
        const reason = result.match?.aiMatchReason || user.aiMatchReason;
        setMatchData({ ...user, aiMatchReason: reason });
      }
    } catch (e) {
      console.error("Swipe API error:", e);
    }
  };

  // --- DOCK ACTIONS ---

  const checkSwipeLimit = (direction: 'left' | 'right' | 'up'): boolean => {
    if (isPremium) return true;
    if (direction === 'left') return true; // Free unlimited left swipes

    if (dailySwipeCount >= 5) {
      triggerHaptic([50, 50, 50]); // Error vibration
      if (onUpgrade) onUpgrade();
      return false;
    }
    return true;
  };

  const triggerSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!checkSwipeLimit(direction)) return;

    if (activeCard) {
      if (direction !== 'left' && onSwipeCountChange) {
        onSwipeCountChange(dailySwipeCount + 1);
      }
      handleSwipeResult(direction, activeCard);
    }
  };

  const handleRewind = () => {
    if (swipeHistory.length === 0) return;
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }
    // Removing from history makes it reappear in the memoized stack
    onSwipeHistoryChange(prev => prev.slice(0, -1));
  };

  const handleRewindAllDisliked = () => {
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }
    triggerHaptic([20, 40, 20]);
    // Filter out all "left" swipes from history so they reappear in the deck
    onSwipeHistoryChange(prev => prev.filter(h => h.direction !== 'left'));
  };

  const handleBoost = () => {
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }
    if (isBoostActive) return;
    setIsBoostActive(true);
    triggerHaptic([10, 50, 10]);
    // Auto-disable boost after 10s
    setTimeout(() => setIsBoostActive(false), 10000);
  };

  const handleSuperLikeAction = () => {
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }

    // Simply trigger the logical swipe
    triggerSwipe('up');
  };
  // Replaced with top-level definitions for better scoping
  // const activeIndex = 0;
  // const nextIndex = 1;
  // const activeCard = stack[activeIndex];
  // const nextCard = stack[nextIndex];
  // const hasActiveFilters = !!(filters.location || filters.niche);

  // const dislikedCount = swipeHistory.filter(h => h.direction === 'left').length;

  return (
    <>
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-black">
        {/* Dynamic Blurred Background */}
        <AnimatePresence>
          {activeCard && (
            <motion.div
              key={activeCard.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <img src={activeCard.avatar} alt="Background" className="w-full h-full object-cover opacity-30 blur-[60px] scale-110 saturate-150" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Darkening Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/40 to-black/80 pointer-events-none" />

        {/* Top Control Bar */}
        <div className="absolute top-4 left-0 right-0 z-[60] flex justify-end px-6 items-start pointer-events-none">
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all pointer-events-auto shadow-lg hover:shadow-xl ${hasActiveFilters ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white border-none' : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'}`}
          >
            <SlidersHorizontal size={18} />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full border-2 border-pink-500"></span>}
          </button>
        </div>

        {/* Boost Effect Overlay */}
        <AnimatePresence>
          {isBoostActive && viewMode === 'stack' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-0 border-[8px] border-purple-500/30 shadow-[inset_0_0_100px_rgba(168,85,247,0.4)]"></div>
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute w-full aspect-square bg-purple-500/10 rounded-full"
              />
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-purple-600 text-white font-bold px-6 py-2 rounded-full text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center gap-2 relative z-10"
              >
                <Zap size={16} fill="currentColor" /> Boost Active
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 w-full relative z-[50] h-full">
          {viewMode === 'stack' && (
            <div className="w-full h-full max-w-lg mx-auto flex flex-col justify-center px-4 pb-24">
              {isLoading ? (
                <div className="relative w-full h-[75vh] sm:h-[80vh]">
                  <SkeletonCard />
                </div>
              ) : stack.length === 0 ? (
                <motion.div key="radar-empty-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RadarScan filtersActive={hasActiveFilters} dislikedCount={dislikedCount} onRewindDisliked={handleRewindAllDisliked} />
                </motion.div>
              ) : (
                <div className="relative w-full h-[75vh] sm:h-[80vh]">
                  {nextCard && (
                    <motion.div
                      key={`next-preview-${nextCard.id}`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 0.95, opacity: 0.6 }}
                      className="absolute inset-0 pointer-events-none z-0 transition-all duration-500"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div className="w-full h-full overflow-hidden relative bg-[#1a1a1a] border border-white/20 rounded-3xl !p-0 shadow-2xl">
                        <ProfileCard user={nextCard} role={currentUserRole} isPremium={isPremium} />
                      </div>
                    </motion.div>
                  )}
                  <AnimatePresence mode="popLayout" custom={lastSwipeDir}>
                    {activeCard && (
                      <DraggableCard
                        key={activeCard.id}
                        user={activeCard}
                        role={currentUserRole}
                        isPremium={isPremium}
                        dailySwipeCount={dailySwipeCount}
                        onSwipeCountChange={onSwipeCountChange}
                        onUpgrade={onUpgrade}
                        onSwipe={(dir) => {
                          handleSwipeResult(dir, activeCard);
                        }}
                        onClick={() => {
                          setSelectedGridUser(activeCard);
                        }}
                        customSwipeDir={lastSwipeDir}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="w-full h-full overflow-y-auto px-4 pt-20 pb-32 no-scrollbar">
              {isLoading ? (
                <SkeletonGrid />
              ) : stack.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <RadarScan filtersActive={hasActiveFilters} dislikedCount={dislikedCount} onRewindDisliked={handleRewindAllDisliked} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-10">
                  {stack.map((user) => (
                    <GridItemCard key={user.id} user={user} onClick={() => setSelectedGridUser(user)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Dock - Clean Professional Pill */}
        {viewMode === 'stack' && !isLoading && (
          <div className="absolute bottom-8 left-0 w-full z-[80] flex justify-center pointer-events-none px-4 shrink-0 transition-all duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex items-center gap-2 sm:gap-4 px-4 py-2 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full shadow-lg relative overflow-hidden group pointer-events-auto">
              {/* Rewind */}
              <button
                onClick={handleRewind}
                disabled={swipeHistory.length === 0}
                className={`p-3 rounded-full transition-colors flex items-center justify-center disabled:opacity-30 ${swipeHistory.length > 0 ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10" : "text-gray-400"}`}
              >
                <RotateCcw size={20} strokeWidth={2.5} />
              </button>

              {/* Reject */}
              <button
                onClick={() => { if (activeCard) triggerSwipe('left'); }}
                disabled={stack.length === 0}
                className="w-14 h-14 rounded-full border-2 border-red-100 dark:border-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 mx-1"
              >
                <X size={28} strokeWidth={3} />
              </button>

              {/* Super Like */}
              <button
                onClick={() => { if (activeCard) handleSuperLikeAction(); }}
                disabled={stack.length === 0}
                className={`p-3 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 ${isPremium ? "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
              >
                <Star size={24} fill="currentColor" />
              </button>

              {/* Like */}
              <button
                onClick={() => { if (activeCard) triggerSwipe('right'); }}
                disabled={stack.length === 0}
                className="w-14 h-14 rounded-full border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-500 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50 mx-1"
              >
                <Heart size={28} fill="currentColor" />
              </button>

              {/* Boost */}
              <button
                onClick={handleBoost}
                className={`p-3 rounded-full transition-colors flex items-center justify-center ${isBoostActive ? "text-purple-500 bg-purple-50 dark:bg-purple-500/10" : "text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10"}`}
              >
                <Zap size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {matchData && (
          <MatchOverlay
            candidate={matchData}
            isPremium={isPremium}
            onUpgrade={onUpgrade}
            onClose={() => setMatchData(null)}
            onChat={() => {
              if (onMatchChat) onMatchChat(matchData);
              setMatchData(null);
            }}
          />
        )}
        {isFilterOpen && (
          <FilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            currentFilters={filters}
            onApply={setFilters}
          />
        )}
        {selectedGridUser && (
          <ProfileDetailModal
            user={selectedGridUser}
            role={currentUserRole}
            isPremium={isPremium}
            onClose={() => setSelectedGridUser(null)}
            onAction={(dir) => {
              handleSwipeResult(dir, selectedGridUser);
              setSelectedGridUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

interface DraggableCardProps {
  user: User;
  role?: UserRole;
  isPremium?: boolean;
  dailySwipeCount?: number;
  onSwipeCountChange?: (count: number) => void;
  onUpgrade?: () => void;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
  onClick?: () => void;
  customSwipeDir?: 'left' | 'right' | 'up';
}

const DraggableCard = forwardRef<SwipeCardHandle, DraggableCardProps>(({ user, role, isPremium, dailySwipeCount = 0, onSwipeCountChange, onUpgrade, onSwipe, onClick, customSwipeDir = 'left' }, ref) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const isDraggingRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const flyOut = useCallback((dir: 'left' | 'right' | 'up') => {
    setIsSwiping(true);
    const flyX = dir === 'left' ? -1000 : dir === 'right' ? 1000 : 0;
    const flyY = dir === 'up' ? -1200 : 0;

    animateValue(x, flyX, { duration: 0.3, ease: 'easeOut' });
    animateValue(y, flyY, { duration: 0.3, ease: 'easeOut' });

    // Delay parent state update until animation finishes back in the parent
    setTimeout(() => {
      onSwipe(dir);
    }, 300);
  }, [x, y, onSwipe]);

  useImperativeHandle(ref, () => ({
    triggerSwipe: async (direction) => {
      flyOut(direction);
    }
  }), [flyOut]);

  const opacityLike = useTransform(x, [20, 150], [0, 1]);
  const opacityNope = useTransform(x, [-20, -150], [0, 1]);
  const opacitySuper = useTransform(y, [-20, -150], [0, 1]);

  const glow = useTransform(
    x,
    [-200, 0, 200],
    ['0px 0px 50px rgba(239, 68, 68, 0.4)', '0px 0px 0px rgba(0,0,0,0)', '0px 0px 50px rgba(34, 197, 94, 0.4)']
  );

  // Using a ref to track the last down position to explicitly cancel taps that are actually drags

  const handleDragEnd = async (_: any, info: any) => {
    // Reset drag flag slightly after drag ends so onTap doesn't catch it
    setTimeout(() => { isDraggingRef.current = false; }, 100);

    const threshold = 100;
    const { x: xOff, y: yOff } = info.offset;
    const { x: vX, y: vY } = info.velocity;

    if (isSwiping) return;

    if (xOff > threshold || vX > 500) {
      if (!isPremium && dailySwipeCount >= 5) {
        triggerHaptic([50, 50, 50]);
        animateValue(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
        animateValue(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
        if (onUpgrade) onUpgrade();
        return;
      }
      triggerHaptic(20);
      flyOut('right');
    } else if (xOff < -threshold || vX < -500) {
      triggerHaptic(20);
      flyOut('left');
    } else if (yOff < -threshold || vY < -500) {
      if (!isPremium) {
        triggerHaptic([50, 50]);
        animateValue(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
        animateValue(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
        if (onUpgrade) onUpgrade();
        return;
      }
      triggerHaptic([15, 30, 15]);
      flyOut('up');
    } else {
      animateValue(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      animateValue(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
    }
  };

  return (
    <motion.div
      drag={!isSwiping}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      dragSnapToOrigin={true}
      onDragStart={() => { isDraggingRef.current = true; }}
      onDragEnd={handleDragEnd}
      onTap={() => {
        // Only fire tap if we haven't been dragging
        if (!isDraggingRef.current && onClick) onClick();
      }}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      custom={customSwipeDir}
      exit={(custom: any) => ({
        x: custom === 'left' ? -1000 : custom === 'right' ? 1000 : 0,
        y: custom === 'up' ? -1200 : 0,
        opacity: 0,
        rotate: custom === 'left' ? -30 : custom === 'right' ? 30 : 0,
        transition: { duration: 0.3 }
      })}
      style={{
        x, y, rotate,
        boxShadow: glow,
        touchAction: 'none',
        willChange: 'transform',
        pointerEvents: isSwiping ? 'none' : 'auto',
        zIndex: isSwiping ? 50 : 100
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-3xl"
    >
      <div className="pointer-events-none h-full w-full">
        <ProfileCard user={user} role={role} isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>

      <motion.div style={{ opacity: opacityLike }} className="absolute top-10 left-8 border-4 border-green-400 text-green-400 font-bold text-4xl px-4 py-2 rounded-xl -rotate-12 bg-black/50 backdrop-blur-md z-50 pointer-events-none">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: opacityNope }} className="absolute top-10 right-8 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-12 bg-black/50 backdrop-blur-md z-50 pointer-events-none">
        NOPE
      </motion.div>
      <motion.div style={{ opacity: opacitySuper }} className="absolute bottom-32 left-1/2 -translate-x-1/2 border-4 border-blue-400 text-blue-400 font-bold text-3xl px-4 py-2 rounded-xl -rotate-6 bg-black/50 backdrop-blur-md z-50 pointer-events-none whitespace-nowrap shadow-[0_0_30px_rgba(96,165,250,0.5)]">
        SUPER LIKE
      </motion.div>
    </motion.div>
  );
});

const ActionButton: React.FC<{
  icon: React.ReactNode;
  color: string;
  bg: string;
  size?: 'normal' | 'large';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ icon, color, bg, size = 'normal', onClick, disabled, className = '' }) => {
  const isLarge = size === 'large';

  const handleClick = () => {
    if (!disabled) {
      triggerHaptic(10);
      onClick();
    }
  };

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      onClick={handleClick}
      disabled={disabled}
      className={`
        rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-200
        ${bg} ${color}
        border dark:border-white/5
        ${isLarge ? 'w-16 h-16 text-xl' : 'w-12 h-12'}
        ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl'}
        ${className}
      `}
    >
      {icon}
    </motion.button>
  );
};
