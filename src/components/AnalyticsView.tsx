import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/firebaseService';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { ChevronLeft, TrendingUp, Users, Target, Activity, Lock, Eye, ArrowUpRight, Crown, BarChart3, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsViewProps {
    user: User;
    onBack: () => void;
    onUpgrade: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, onBack, onUpgrade }) => {
    const [stats, setStats] = useState({ profileViews: 0, matchRate: 0 });
    const [chartData, setChartData] = useState<{ day: string, value: number }[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await api.getAnalyticsStats(user.id);
                setStats({ profileViews: data.profileViews, matchRate: data.matchRate });
                setChartData(data.chartData);
                setRecentActivity(data.recentActivity);
            } catch (e) {
                console.error("Error loading analytics data:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, [user.id]);

    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 1) : 1;

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col relative overflow-y-auto bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white pb-24">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 z-20 bg-gray-50/90 dark:bg-[#050505]/90 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Performance</h1>
                    <p className="text-xs text-gray-500 dark:text-white/50">Insights & Analytics</p>
                </div>
            </div>

            <div className="px-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* Top Metric Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-5 flex flex-col gap-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10" hoverEffect={false}>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Eye size={16} />
                        </div>
                        <div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">{stats.profileViews}</span>
                                {stats.profileViews > 0 && <span className="text-xs text-green-500 font-bold flex items-center mb-1"><ArrowUpRight size={12} /> Live</span>}
                            </div>
                            <span className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">Profile Views</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-5 flex flex-col gap-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10" hoverEffect={false}>
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center">
                            <Target size={16} />
                        </div>
                        <div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">{stats.matchRate}%</span>
                                {stats.matchRate > 0 && <span className="text-xs text-green-500 font-bold flex items-center mb-1"><ArrowUpRight size={12} /> Active</span>}
                            </div>
                            <span className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">Swipe Match Rate</span>
                        </div>
                    </GlassCard>
                </div>

                {/* Activity Chart */}
                <GlassCard className="p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10" hoverEffect={false}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Impressions Weekly</h3>
                            <p className="text-xs text-gray-500 dark:text-white/40">Last 7 days views</p>
                        </div>
                    </div>

                    <div className="h-40 flex items-end justify-between gap-2">
                        {chartData.map((data, i) => {
                            const heightPercent = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                                    <div className="w-full relative h-full flex items-end justify-center">
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-8 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {data.value} views
                                        </div>
                                        {/* Bar */}
                                        <motion.div
                                            style={{ height: `${heightPercent}%` }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: i * 0.05 }}
                                            className={`w-full max-w-[2rem] rounded-t-md transition-colors ${data.value > 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-white/10'} group-hover:bg-blue-400`}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase">{data.day}</span>
                                </div>
                            );
                        })}
                        {chartData.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-white/40 text-sm font-bold">No activity yet.</div>
                        )}
                    </div>
                </GlassCard>

                {/* Recent Audience Activity */}
                <div>
                    <h3 className="px-1 text-sm font-bold text-gray-500 dark:text-white/40 mb-3 tracking-wide uppercase">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <div className="text-center p-6 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-gray-400 dark:text-white/40 text-sm">
                                Match or get swiped on to see activity here.
                            </div>
                        ) : (
                            recentActivity.map((act, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                        {act.direction === 'up' ? <Zap size={16} /> : <Eye size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{act.direction === 'up' ? 'Someone Super Liked you!' : 'Someone discovered your profile'}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-white/40 font-bold">
                                        {Math.floor((Date.now() - act.timestamp) / 3600000) > 0
                                            ? `${Math.floor((Date.now() - act.timestamp) / 3600000)}h ago`
                                            : 'Just now'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Premium Features Upsell */}
                <div className="relative overflow-hidden rounded-[2rem] border border-yellow-500/30 p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 mt-4 group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-yellow-500 text-black p-1.5 rounded-full"><Crown size={14} fill="currentColor" /></div>
                            <h3 className="font-bold text-yellow-600 dark:text-yellow-500">Advanced Insights</h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 opacity-60">
                                <Lock size={16} className="mt-0.5 text-gray-500 dark:text-white/50" />
                                <div>
                                    <h4 className="font-bold text-sm">See Who Liked You</h4>
                                    <p className="text-xs text-gray-500 dark:text-white/50">Instantly match with people who already swiped right.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 opacity-60">
                                <Lock size={16} className="mt-0.5 text-gray-500 dark:text-white/50" />
                                <div>
                                    <h4 className="font-bold text-sm">Audience Demographics</h4>
                                    <p className="text-xs text-gray-500 dark:text-white/50">Breakdown of age, location, and interests of your viewers.</p>
                                </div>
                            </div>
                        </div>

                        <Button fullWidth onClick={onUpgrade} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-[0_10px_30px_rgba(234,179,8,0.3)] hover:shadow-[0_15px_40px_rgba(234,179,8,0.4)] relative z-20">
                            {user.isPremium ? "Manage Subscription" : "Unlock with Gold"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};
