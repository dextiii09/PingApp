
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, Eye, Heart, BarChart3, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User } from '../types';

interface AnalyticsViewProps {
  user: User;
  onBack: () => void;
}

// Mock Data
const engagementData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 650 },
  { name: 'Sat', value: 800 },
  { name: 'Sun', value: 900 },
];

const demographicData = [
  { name: '18-24', value: 35 },
  { name: '25-34', value: 45 },
  { name: '35-44', value: 15 },
  { name: '45+', value: 5 },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full w-full bg-white dark:bg-[#050505] flex flex-col relative overflow-hidden"
    >
        {/* Header */}
        <div className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 z-20 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar space-y-6">
            
            {/* Overview Section */}
            <div>
               <h3 className="text-sm font-bold text-gray-500 dark:text-white/40 mb-3 px-1 uppercase tracking-wider">Overview (7 Days)</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Eye size={48} />
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-pink-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider relative z-10">
                          <Eye size={14} /> Profile Views
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white relative z-10">1.2k</div>
                      <div className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1 relative z-10">
                          <TrendingUp size={10} /> +12.5%
                      </div>
                  </div>
                  <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Heart size={48} />
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider relative z-10">
                          <Heart size={14} /> Likes
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white relative z-10">342</div>
                      <div className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1 relative z-10">
                          <TrendingUp size={10} /> +5.2%
                      </div>
                  </div>
               </div>
            </div>

            {/* Engagement Chart */}
            <div className="rounded-3xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity size={18} className="text-purple-500" /> Activity
                    </h3>
                    <select className="bg-gray-100 dark:bg-white/10 border-none text-xs font-bold rounded-lg px-2 py-1 text-gray-600 dark:text-white/70 outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={engagementData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8b5cf6" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Audience Demographics */}
            <div className="rounded-3xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users size={18} className="text-orange-500" /> Audience Age
                    </h3>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demographicData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 10, fill: '#6b7280', fontWeight: 600}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                            />
                            <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={16} animationDuration={1500}>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Locations */}
            <div className="rounded-3xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-cyan-500" /> Top Cities
                </h3>
                <div className="space-y-4">
                    {[
                        { city: 'New York, USA', percent: 45 },
                        { city: 'London, UK', percent: 22 },
                        { city: 'Los Angeles, USA', percent: 18 }
                    ].map((loc, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-white/80">
                                <span>{loc.city}</span>
                                <span>{loc.percent}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                                <div 
                                    className="bg-cyan-500 h-2 rounded-full" 
                                    style={{ width: `${loc.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </motion.div>
  );
};
