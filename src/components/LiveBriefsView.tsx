import React, { useState, useEffect } from 'react';
import { LiveBrief, User, UserRole } from '../types';
import { api } from '../services/firebaseService';
import { GlassCard } from './GlassCard';
import { Clock, Zap, MapPin, IndianRupee, Users, ArrowLeft, Send, Sparkles, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import confetti from 'canvas-confetti';

interface LiveBriefsViewProps {
    user: User;
    onBack: () => void;
    onNavigateToChat: (matchId: string) => void;
    onUpgrade?: () => void;
}

export const LiveBriefsView: React.FC<LiveBriefsViewProps> = ({ user, onBack, onNavigateToChat, onUpgrade }) => {
    const [briefs, setBriefs] = useState<LiveBrief[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newBrief, setNewBrief] = useState({ title: '', description: '', budget: '', location: '', tags: '', deadlineHours: '24' });

    useEffect(() => {
        loadBriefs();
    }, []);

    const loadBriefs = async () => {
        setLoading(true);
        try {
            // In a real app, this would be a real-time subscription or fresh fetch
            const data = await api.getLiveBriefs();
            setBriefs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (brief: LiveBrief) => {
        setApplyingId(brief.id);
        try {
            await api.applyToLiveBrief(brief.id);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ec4899', '#f59e0b', '#ffffff']
            });
            // Refresh list or mark as applied
            setBriefs(prev => prev.map(b => b.id === brief.id ? { ...b, applicationsCount: b.applicationsCount + 1 } : b));
        } catch (e) {
            alert("Failed to apply. You might have already applied to this brief.");
        } finally {
            setApplyingId(null);
        }
    };

    const handleCreateBrief = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.createLiveBrief({
                title: newBrief.title,
                description: newBrief.description,
                budget: newBrief.budget,
                location: newBrief.location,
                tags: newBrief.tags.split(',').map(t => t.trim()).filter(Boolean),
                deadline: Date.now() + parseInt(newBrief.deadlineHours) * 60 * 60 * 1000,
            });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setShowCreateModal(false);
            loadBriefs();
            setNewBrief({ title: '', description: '', budget: '', location: '', tags: '', deadlineHours: '24' });
        } catch (err) {
            alert("Failed to create brief");
        } finally {
            setIsCreating(false);
        }
    };

    const formatDeadline = (timestamp: number) => {
        const diff = timestamp - Date.now();
        if (diff <= 0) return "Expired";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m left`;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden safe-top">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-white/80"><ArrowLeft size={24} /></button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Live Briefs <Zap size={18} className="text-orange-500 fill-orange-500" />
                        </h1>
                        <p className="text-[10px] text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest">Time-Sensitive Ops</p>
                    </div>
                </div>
                {user.role === UserRole.BUSINESS && (
                    <Button size="sm" onClick={() => setShowCreateModal(true)} className="h-9 rounded-full bg-pink-500 border-none text-[10px] font-bold uppercase tracking-wider">
                        Post Brief
                    </Button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-mono tracking-widest uppercase">Fetching Live Briefs...</p>
                    </div>
                ) : briefs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                        <AlertCircle size={48} className="text-gray-300" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No active briefs</h3>
                            <p className="text-sm text-gray-500">Check back soon for new opportunities.</p>
                        </div>
                    </div>
                ) : (
                    briefs.map((brief) => (
                        <motion.div
                            key={brief.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="overflow-hidden border-orange-500/20 group">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <img src={brief.brandAvatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt={brief.brandName} />
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{brief.brandName}</h4>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-white/40 font-medium">
                                                    <MapPin size={10} /> {brief.location}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border border-orange-500/20">
                                            <Clock size={12} /> {formatDeadline(brief.deadline)}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{brief.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-2">{brief.description}</p>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                                            <IndianRupee size={14} className="text-green-500" /> {brief.budget}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-white/40">
                                            <Users size={14} /> {brief.applicationsCount} Applications
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <div className="flex-1 flex gap-1 flex-wrap">
                                            {brief.tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/10 uppercase tracking-tighter">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button
                                            fullWidth
                                            className="bg-orange-500 hover:bg-orange-600 border-none text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                            onClick={() => handleApply(brief)}
                                            disabled={applyingId === brief.id}
                                        >
                                            {applyingId === brief.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Zap size={18} fill="currentColor" />}
                                            Apply with One-Tap
                                        </Button>
                                        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* AI Score Overlay for Premium Users */}
                                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3 flex items-center justify-between border-t border-white/5 opacity-80">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-indigo-400" />
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Compatibility</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-indigo-400">92% MATCH</span>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Brief Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="bg-white dark:bg-[#0f0c29] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Zap size={20} className="text-orange-500" /> New Live Brief
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto overflow-x-hidden relative flex-1">
                                <form id="createBriefForm" onSubmit={handleCreateBrief} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Title</label>
                                        <input type="text" value={newBrief.title} onChange={e => setNewBrief({ ...newBrief, title: e.target.value })} required className="mt-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all dark:text-white" placeholder="e.g. Summer UGC Campaign" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                                        <textarea value={newBrief.description} onChange={e => setNewBrief({ ...newBrief, description: e.target.value })} required rows={3} className="mt-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all dark:text-white resize-none" placeholder="What exactly are you looking for?" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Budget</label>
                                            <input type="text" value={newBrief.budget} onChange={e => setNewBrief({ ...newBrief, budget: e.target.value })} required className="mt-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all dark:text-white" placeholder="e.g. $500 - $1k" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration</label>
                                            <select value={newBrief.deadlineHours} onChange={e => setNewBrief({ ...newBrief, deadlineHours: e.target.value })} className="mt-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all dark:text-white appearance-none">
                                                <option value="12">12 Hours (Flash)</option>
                                                <option value="24">24 Hours (Standard)</option>
                                                <option value="48">48 Hours (Extended)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Location / Market</label>
                                        <input type="text" value={newBrief.location} onChange={e => setNewBrief({ ...newBrief, location: e.target.value })} className="mt-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all dark:text-white" placeholder="e.g. Remote, or New York NY" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tags (Comma Separated)</label>
                                        <input type="text" value={newBrief.tags} onChange={e => setNewBrief({ ...newBrief, tags: e.target.value })} required className="mt-1 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all dark:text-white" placeholder="fashion, lifestyle, ugc" />
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-white/10 shrink-0">
                                <Button type="submit" form="createBriefForm" fullWidth className="h-12 bg-orange-500 hover:bg-orange-600 border-none shadow-lg shadow-orange-500/20">
                                    {isCreating ? 'Posting...' : 'Post Live Brief'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
