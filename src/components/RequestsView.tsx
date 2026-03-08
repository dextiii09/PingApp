import React, { useState, useEffect } from 'react';
import { User, Match } from '../types';
import { api } from '../services/firebaseService';
import { ArrowLeft, Check, X, ShieldCheck, Zap, Sparkles, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import confetti from 'canvas-confetti';

interface RequestsViewProps {
    user: User;
    onBack: () => void;
    onMatchCreated: (match: Match) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({ user, onBack, onMatchCreated }) => {
    const [requests, setRequests] = useState<{ userId: string; userProfile: User; timestamp: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        const reqs = await api.getInboundRequests(user.id);
        setRequests(reqs);
        setIsLoading(false);
    };

    const handleAccept = async (brandId: string) => {
        setProcessingId(brandId);
        const match = await api.acceptRequest(user.id, brandId);
        if (match) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setRequests(prev => prev.filter(r => r.userId !== brandId));
            // Optional delay to let confetti show
            setTimeout(() => {
                onMatchCreated(match);
            }, 1500);
        }
        setProcessingId(null);
    };

    const handleDecline = async (brandId: string) => {
        setProcessingId(brandId);
        await api.declineRequest(user.id, brandId);
        setRequests(prev => prev.filter(r => r.userId !== brandId));
        setProcessingId(null);
    };

    const timeAgo = (ms: number) => {
        const diff = Date.now() - ms;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors group">
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <Inbox className="text-pink-500" size={24} /> Collaboration Requests
                        </h1>
                        <p className="text-gray-500 dark:text-white/40 text-sm">Brands who want to work with you</p>
                    </div>
                </div>
            </div>

            {/* Content list */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl w-full"></div>
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-white/20">
                            <Inbox size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your inbox is empty</h3>
                        <p className="text-sm text-gray-500 dark:text-white/40">Optimize your profile and keep your portfolio fresh to attract more brands.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {requests.map(({ userId, userProfile, timestamp }) => (
                            <motion.div
                                key={userId}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="relative"
                            >
                                <GlassCard className="p-4 bg-gray-50 dark:bg-[#1a1a1a] border-gray-100 dark:border-white/5 flex gap-4 overflow-hidden group">
                                    <img src={userProfile.avatar} alt={userProfile.name} className="w-20 h-20 rounded-xl object-cover bg-gray-200 dark:bg-white/10 shrink-0 border border-black/5 dark:border-white/10" />

                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate text-lg">
                                                    {userProfile.name}
                                                    {userProfile.verified && <ShieldCheck size={14} className="text-blue-500 shrink-0" />}
                                                </h3>
                                                <span className="text-[10px] uppercase font-bold text-pink-500 dark:text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded shrink-0">{timeAgo(timestamp)}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-white/60 line-clamp-1 truncate mt-0.5">{userProfile.bio}</p>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleAccept(userId)}
                                                disabled={processingId === userId}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
                                            >
                                                <Check size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleDecline(userId)}
                                                disabled={processingId === userId}
                                                className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold text-xs py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                            >
                                                <X size={16} /> Decline
                                            </button>
                                        </div>
                                    </div>

                                    {/* Premium indicator logic (Mocking a Live Brief or Boost factor visually to look cool) */}
                                    {userProfile.isPremium && (
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 p-0.5 shadow-lg flex items-center justify-center">
                                                <Sparkles size={12} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
