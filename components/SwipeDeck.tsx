
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/mockService';
import { X, Heart, Star, MapPin, SlidersHorizontal, Search, Zap, RotateCcw, PlayCircle, Mic, ChevronDown } from 'lucide-react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { ProfileCard } from './ProfileCard';

interface SwipeDeckProps {
  candidates: User[];
  currentUserRole?: UserRole;
  isPremium?: boolean;
  onUpgrade?: () => void;
  onSwipe: (direction: 'left' | 'right' | 'up', candidate: User) => void;
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
      // Catch errors on devices that throw when vibration is blocked
    }
  }
};

// --- SUB-COMPONENTS ---

const FilterModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onApply: (filters: { location: string; niche: string }) => void;
  currentFilters: { location: string; niche: string };
}> = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [loc, setLoc] = useState(currentFilters.location);
  const [niche, setNiche] = useState(currentFilters.niche);

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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
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

const MatchOverlay: React.FC<{ candidate: User; onClose: () => void; onChat: () => void }> = ({ candidate, onClose, onChat }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6"
  >
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
       {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            initial={{ y: -10, x: Math.random() * window.innerWidth, opacity: 1 }}
            animate={{ y: window.innerHeight + 10, rotate: 360 }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-2 h-2 bg-gradient-to-tr from-pink-500 to-yellow-500 rounded-full"
          />
       ))}
    </div>

    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="text-center space-y-8 relative z-10"
    >
      <div className="font-mono text-pink-500 font-bold tracking-widest text-xl animate-pulse">IT'S A MATCH!</div>
      
      <div className="flex items-center justify-center gap-4">
         <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <img src="https://picsum.photos/200/200" className="w-full h-full object-cover" /> 
         </div>
         <div className="w-24 h-24 rounded-full border-4 border-pink-500 overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.5)]">
            <img src={candidate.avatar} className="w-full h-full object-cover" />
         </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-2">You & {candidate.name}</h2>
        <p className="text-white/60">vibe with each other.</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
         <Button fullWidth onClick={onChat} className="flex items-center gap-2 justify-center">
            Message
         </Button>
         <Button fullWidth variant="secondary" onClick={onClose}>
            Keep Swiping
         </Button>
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
    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
  >
    <div className="p-4 flex justify-between items-center shrink-0">
       <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
          <ChevronDown size={24} />
       </button>
       <span className="font-bold text-white text-sm tracking-widest uppercase">Profile Detail</span>
       <div className="w-10"></div>
    </div>

    <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col justify-center">
       <div className="w-full max-w-lg mx-auto h-full max-h-[75vh] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <ProfileCard user={user} role={role} isPremium={isPremium} expanded={true} />
       </div>
    </div>

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
      <img src={user.avatar} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
      
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
         {user.voiceIntroUrl && (
            <div className="bg-purple-500/80 backdrop-blur-sm text-white p-1 rounded-full flex items-center justify-center">
                <Mic size={10} fill="currentColor" />
            </div>
         )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 text-white">
        <h3 className="font-bold text-sm truncate">{user.name}</h3>
        <div className="flex items-center gap-1 text-[10px] text-white/70">
           <MapPin size={10} /> {user.location?.split(',')[0]}
        </div>
        <div className="flex gap-1 mt-1.5">
           {user.tags.slice(0, 1).map(t => (
             <span key={t} className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm truncate">{t}</span>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

const RadarScan = ({ filtersActive }: { filtersActive: boolean }) => (
  <div className="flex flex-col items-center justify-center h-full relative w-full pb-32">
     <div className="absolute w-64 h-64 border border-pink-500/20 rounded-full animate-ping opacity-20" />
     <div className="absolute w-48 h-48 border border-pink-500/30 rounded-full animate-ping opacity-30 animation-delay-500" />
     
     <div className="relative w-24 h-24 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_50px_rgba(236,72,153,0.2)]">
        <div className="absolute inset-0 rounded-full border-t-2 border-pink-500 animate-spin"></div>
     </div>
     
     <h3 className="mt-8 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
       {filtersActive ? 'No Matches Found' : 'All Caught Up'}
     </h3>
     <p className="text-gray-500 dark:text-white/40 text-sm mt-2">
       {filtersActive ? 'Try adjusting your filters.' : 'Check back later for more.'}
     </p>
  </div>
);

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ candidates, currentUserRole, isPremium, onUpgrade, onSwipe, onMatchChat }) => {
  const [stack, setStack] = useState(candidates);
  const [history, setHistory] = useState<User[]>([]); 
  const [matchData, setMatchData] = useState<User | null>(null);
  const [isBoostActive, setIsBoostActive] = useState(false);
  
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [selectedGridUser, setSelectedGridUser] = useState<User | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ location: '', niche: '' });

  const activeCardRef = useRef<SwipeCardHandle>(null);

  useEffect(() => {
    const swipedIds = new Set(history.map(u => u.id));
    let filtered = candidates.filter(c => !swipedIds.has(c.id));

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

    setStack(filtered);
  }, [candidates, filters, history]);

  const popCard = useCallback((id: string) => {
    const card = stack.find(u => u.id === id);
    if (card) {
      setHistory(prev => [...prev, card]);
    }
  }, [stack]);

  const handleSwipeResult = async (direction: 'left' | 'right' | 'up', user: User) => {
    popCard(user.id);
    onSwipe(direction, user); // Pass the whole profile

    if (direction === 'up') {
       triggerHaptic([30, 20, 30]); 
       confetti({
         particleCount: 100,
         spread: 70,
         origin: { y: 0.7 },
         colors: ['#60A5FA', '#3B82F6', '#FFFFFF'], 
         zIndex: 100
       });
    } else {
       triggerHaptic(10);
    }

    if (direction === 'right' || direction === 'up') {
       const result = await api.swipe('current-user-id', user.id, direction);
       if (result.isMatch) {
          setMatchData(user);
       }
    }
  };

  const triggerSwipe = (direction: 'left' | 'right' | 'up') => {
    if (activeCardRef.current && stack.length > 0) {
      activeCardRef.current.triggerSwipe(direction);
    }
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }
    setHistory(prev => prev.slice(0, -1));
  };

  const handleBoost = () => {
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }
    if (isBoostActive) return;
    setIsBoostActive(true);
    triggerHaptic([10, 50, 10]);
    setStack(prevStack => {
      if (prevStack.length <= 1) return prevStack;
      const [current, ...rest] = prevStack;
      const sortedRest = [...rest].sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
      return [current, ...sortedRest];
    });
    setTimeout(() => setIsBoostActive(false), 10000); 
  };

  const activeIndex = 0;
  const nextIndex = 1;
  const activeCard = stack[activeIndex];
  const nextCard = stack[nextIndex];
  const hasActiveFilters = !!(filters.location || filters.niche);

  return (
    <>
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10 pointer-events-none" />

        <div className="absolute top-4 left-0 right-0 z-30 flex justify-end px-6 items-start pointer-events-none">
           <button 
              onClick={() => setIsFilterOpen(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all pointer-events-auto ${hasActiveFilters ? 'bg-pink-500 text-white border-pink-400' : 'bg-black/40 text-white/70 border-white/10 hover:bg-black/60 hover:text-white'}`}
            >
              <SlidersHorizontal size={18} />
              {hasActiveFilters && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f0c29]"></span>}
            </button>
        </div>

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

        <div className="flex-1 w-full relative z-0 h-full">
           {viewMode === 'stack' && (
             <div className="w-full h-full max-w-lg mx-auto flex flex-col justify-center px-4 pb-24">
               {stack.length === 0 ? (
                 <RadarScan filtersActive={hasActiveFilters} />
               ) : (
                 <div className="relative w-full h-[75vh] sm:h-[80vh]">
                   <AnimatePresence mode="popLayout">
                     {nextCard && (
                       <div className="absolute inset-0 scale-95 opacity-60 pointer-events-none z-0 transition-transform duration-300">
                          <div className="w-full h-full overflow-hidden relative bg-[#1a1a1a] border border-white/20 rounded-3xl !p-0 shadow-2xl">
                             <ProfileCard user={nextCard} role={currentUserRole} isPremium={isPremium} />
                          </div>
                       </div>
                     )}
                     
                     {activeCard && (
                       <DraggableCard 
                         ref={activeCardRef}
                         key={activeCard.id}
                         user={activeCard}
                         role={currentUserRole}
                         isPremium={isPremium}
                         onUpgrade={onUpgrade}
                         onSwipe={(dir) => handleSwipeResult(dir, activeCard)}
                         onClick={() => setSelectedGridUser(activeCard)}
                       />
                     )}
                   </AnimatePresence>
                 </div>
               )}
             </div>
           )}

           {viewMode === 'grid' && (
             <div className="w-full h-full overflow-y-auto px-4 pt-20 pb-24 no-scrollbar">
                {stack.length === 0 ? (
                   <div className="h-full flex items-center justify-center">
                     <RadarScan filtersActive={hasActiveFilters} />
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

        {viewMode === 'stack' && (
          <div className="absolute bottom-8 left-0 w-full z-[60] flex justify-center items-center gap-6 px-6 pointer-events-none">
             <ActionButton 
               icon={<RotateCcw size={20} />} 
               color={history.length > 0 ? "text-yellow-400" : "text-white/30"} 
               bg="bg-black/60 border-white/5" 
               onClick={handleRewind}
               disabled={history.length === 0}
               className="pointer-events-auto"
             />
             <ActionButton 
               icon={<X size={32} />} 
               color="text-red-500" 
               bg="bg-black/80 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]" 
               size="large" 
               onClick={() => triggerSwipe('left')}
               disabled={stack.length === 0}
               className="pointer-events-auto"
             />
             <div className="relative -mt-8 pointer-events-auto">
               <ActionButton 
                 icon={<Star size={24} fill="currentColor" />} 
                 color="text-blue-400" 
                 bg="bg-black/80 border-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:shadow-[0_0_40px_rgba(96,165,250,0.6)] hover:bg-blue-500/10" 
                 onClick={() => triggerSwipe('up')}
                 disabled={stack.length === 0}
                 className="scale-110 hover:scale-125 transition-all duration-300 ring-4 ring-black"
               />
             </div>
             <ActionButton 
               icon={<Heart size={32} fill="currentColor" />} 
               color="text-green-500" 
               bg="bg-black/80 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]" 
               size="large" 
               onClick={() => triggerSwipe('right')}
               disabled={stack.length === 0}
               className="pointer-events-auto"
             />
             <ActionButton 
               icon={<Zap size={20} fill="currentColor" />} 
               color={isBoostActive ? "text-white" : "text-purple-500"} 
               bg={isBoostActive ? "bg-purple-500 border-purple-400" : "bg-black/60 border-purple-500/20"} 
               onClick={handleBoost} 
               className="pointer-events-auto"
             />
          </div>
        )}
      </div>

      <AnimatePresence>
        {matchData && (
          <MatchOverlay 
            candidate={matchData} 
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
  onUpgrade?: () => void;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
  onClick?: () => void;
}

const DraggableCard = forwardRef<SwipeCardHandle, DraggableCardProps>(({ user, role, isPremium, onUpgrade, onSwipe, onClick }, ref) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const controls = useAnimation();
  const isDraggingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    triggerSwipe: async (direction) => {
      if (direction === 'right') {
         await controls.start({ x: 500, rotate: 20, opacity: 0, transition: { duration: 0.3 } });
      } else if (direction === 'left') {
         await controls.start({ x: -500, rotate: -20, opacity: 0, transition: { duration: 0.3 } });
      } else if (direction === 'up') {
         await controls.start({ y: -800, opacity: 0, transition: { duration: 0.4 } });
      }
      onSwipe(direction);
    }
  }), [controls, onSwipe]);

  const opacityLike = useTransform(x, [20, 150], [0, 1]);
  const opacityNope = useTransform(x, [-20, -150], [0, 1]);
  const opacitySuper = useTransform(y, [-20, -150], [0, 1]);

  const glow = useTransform(
    x, 
    [-200, 0, 200], 
    ['0px 0px 50px rgba(239, 68, 68, 0.4)', '0px 0px 0px rgba(0,0,0,0)', '0px 0px 50px rgba(34, 197, 94, 0.4)']
  );
  
  const handleDragStart = () => {
    isDraggingRef.current = true;
    triggerHaptic(5);
  };

  const handleDragEnd = async (_: any, info: any) => {
    setTimeout(() => {
        isDraggingRef.current = false;
    }, 100);

    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
       triggerHaptic(20); 
       await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
       onSwipe('right');
    } else if (info.offset.x < -threshold || velocity < -500) {
       triggerHaptic(20);
       await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
       onSwipe('left');
    } else if (info.offset.y < -threshold) {
       triggerHaptic([15, 30]); 
       await controls.start({ y: -500, opacity: 0, transition: { duration: 0.2 } });
       onSwipe('up');
    } else {
       controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={() => { if(!isDraggingRef.current && onClick) onClick(); }}
      animate={controls}
      style={{ x, y, rotate, boxShadow: glow }}
      className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none rounded-3xl"
    >
       <ProfileCard user={user} role={role} isPremium={isPremium} onUpgrade={onUpgrade} />
       
       <motion.div style={{ opacity: opacityLike }} className="absolute top-10 left-8 border-4 border-green-400 text-green-400 font-bold text-4xl px-4 py-2 rounded-xl -rotate-12 bg-black/50 backdrop-blur-md z-50 pointer-events-none">
          LIKE
       </motion.div>
       <motion.div style={{ opacity: opacityNope }} className="absolute top-10 right-8 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-12 bg-black/50 backdrop-blur-md z-50 pointer-events-none">
          NOPE
       </motion.div>
       <motion.div style={{ opacity: opacitySuper }} className="absolute bottom-32 left-1/2 -translate-x-1/2 border-4 border-blue-400 text-blue-400 font-bold text-3xl px-4 py-2 rounded-xl -rotate-6 bg-black/50 backdrop-blur-md z-50 pointer-events-none whitespace-nowrap">
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
