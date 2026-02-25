import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/firebaseService';
import { ChevronLeft, Crown, Heart, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface LikesViewProps {
    user: User;
    onBack: () => void;
    onUpgrade: () => void;
    isDarkMode?: boolean;
}

export const LikesView: React.FC<LikesViewProps> = ({ user, onBack, onUpgrade, isDarkMode }) => {
    const [likes, setLikes] = useState<{ profile: User; timestamp: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            const pending = await api.getPendingLikes();
            setLikes(pending);
            setLoading(false);

            // Mark as seen so the badge goes away
            if (pending.length > 0) {
                await api.markLikesAsSeen();
            }
        };
        fetchLikes();
    }, []);

    return (
        <div className={`h-full w-full flex flex-col overflow-y-auto pb-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#050505]' : 'bg-[#f8f9fa]'}`}>
            <div className={`px-4 pt-12 pb-4 sticky top-0 z-20 backdrop-blur-3xl flex items-center gap-4 ${isDarkMode ? 'bg-[#050505]/80' : 'bg-[#f8f9fa]/80'}`}>
                <button onClick={onBack} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{likes.length} Likes</h2>
            </div>

            <div className="px-4 py-2 flex-1">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pt-24">
                        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className={isDarkMode ? 'text-white/50' : 'text-gray-400'}>Loading admirers...</p>
                    </div>
                ) : likes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center pt-24 text-center px-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isDarkMode ? 'bg-white/5 border border-white/10 shadow-black/50' : 'bg-white border border-pink-100 shadow-pink-500/10'}`}>
                            <Heart size={40} className={isDarkMode ? 'text-white/20' : 'text-pink-300'} />
                        </div>
                        <h3 className={`text-2xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No likes yet</h3>
                        <p className={`text-sm leading-relaxed font-bold ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                            Keep swiping and optimizing your profile to get noticed!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {likes.map((like, index) => {
                            const showProfile = user.isPremium;
                            return (
                                <div key={like.profile.id + index} className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg">
                                    <img
                                        src={like.profile.avatar}
                                        alt="Admirer"
                                        className={`w-full h-full object-cover transition-all duration-700 ${!showProfile ? 'blur-xl scale-110 saturate-150 brightness-75' : 'group-hover:scale-105'}`}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        {showProfile ? (
                                            <>
                                                <h3 className="text-white font-bold text-sm truncate">{like.profile.name}</h3>
                                                <p className="text-white/70 text-xs truncate">{like.profile.role}</p>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/20 w-max px-2.5 py-1 rounded-full border border-white/10">
                                                <Crown size={12} className="text-yellow-400" fill="currentColor" />
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">Secret</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {!user.isPremium && likes.length > 0 && !loading && (
                <div className="fixed bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-30 pointer-events-none">
                    <div className="pointer-events-auto">
                        <button
                            onClick={onUpgrade}
                            className="w-full relative group overflow-hidden rounded-[2rem] bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 p-[2px] shadow-2xl shadow-orange-500/20"
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300"></div>
                            <div className={`relative h-14 ${isDarkMode ? 'bg-black/90' : 'bg-white/95'} backdrop-blur-md rounded-[1.9rem] flex items-center justify-center gap-3 px-6 transition-colors duration-300 group-hover:bg-transparent`}>
                                <Sparkles className="text-yellow-500 group-hover:text-white transition-colors" size={20} />
                                <span className={`font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 group-hover:text-white group-hover:bg-none transition-all duration-300`}>
                                    See Who Likes You
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
