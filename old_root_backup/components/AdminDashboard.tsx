
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, VerificationStatus, AdminStats } from '../types';
import { api } from '../services/firebaseService';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { 
  LayoutDashboard, Users, ShieldAlert, BarChart3, CheckCircle, XCircle, 
  Search, Filter, MoreVertical, Eye, EyeOff, Ban, Trash2, FileText, Check, X,
  MessageSquare, AlertTriangle, Terminal, ChevronDown, Loader2, ShieldCheck, Briefcase, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_LOGO } from '../constants';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// --- SUB-COMPONENTS ---

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  trend?: string; 
  subLabel?: string; 
  color: 'cyan' | 'purple' | 'green' | 'yellow';
  data?: { value: number }[];
}> = ({ label, value, trend, subLabel, color, data }) => {
  const colorStyles = {
    cyan: { blob: 'bg-cyan-500/10', hover: 'group-hover:bg-cyan-500/20', stroke: '#06b6d4', fill: '#06b6d4' },
    purple: { blob: 'bg-purple-500/10', hover: 'group-hover:bg-purple-500/20', stroke: '#a855f7', fill: '#a855f7' },
    green: { blob: 'bg-green-500/10', hover: 'group-hover:bg-green-500/20', stroke: '#22c55e', fill: '#22c55e' },
    yellow: { blob: 'bg-yellow-500/10', hover: 'group-hover:bg-yellow-500/20', stroke: '#eab308', fill: '#eab308' },
  };

  const styles = colorStyles[color];

  return (
    <div className={`relative overflow-hidden group bg-black/40 border border-white/10 rounded-xl h-40 flex flex-col justify-between shadow-lg`}>
      {/* Background Blob */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-all opacity-50 ${styles.blob} ${styles.hover}`} />
      
      {/* Content Layer */}
      <div className="relative z-20 p-5 h-full flex flex-col justify-start">
        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">{label}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
          {trend && <span className={`text-[10px] font-mono ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{trend}</span>}
        </div>
        {subLabel && <p className="text-[10px] text-white/30 mt-1 font-mono">{subLabel}</p>}
      </div>

      {/* Sparkline Layer */}
      {data && (
        <div className="absolute bottom-0 left-0 right-0 h-20 z-10 opacity-40 group-hover:opacity-60 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={styles.stroke} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={styles.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={styles.stroke} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#gradient-${color})`} 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
    BANNED: "bg-red-500/10 text-red-400 border-red-500/20",
    SHADOW_BANNED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse",
    VERIFIED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    UNVERIFIED: "bg-white/5 text-white/40 border-white/10"
  };
  
  const style = styles[status] || styles.UNVERIFIED;

  return (
    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono border uppercase tracking-wider ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// --- MODALS ---

const MessageInspectorModal: React.FC<{ user: User | null; onClose: () => void; onBan: (userId: string) => void }> = ({ user, onClose, onBan }) => {
  if (!user) return null;
  
  const logs: any[] = []; // No mock logs by default

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-yellow-500" size={20} />
            <div>
              <h3 className="font-mono text-sm font-bold text-white">MESSAGE_INSPECTOR</h3>
              <p className="text-[10px] text-white/40 font-mono uppercase">TARGET: {user.name} ({user.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 h-96 overflow-y-auto space-y-3 font-mono text-xs bg-black/50">
          {logs.length === 0 ? (
             <div className="flex items-center justify-center h-full text-white/30 italic">No recent message logs found for this user.</div>
          ) : (
            logs.map(log => (
                <div key={log.id} className={`flex gap-3 ${log.type === 'alert' ? 'bg-red-500/10 border border-red-500/20 p-2 rounded' : ''}`}>
                <span className="text-white/30 shrink-0 w-16">{log.time}</span>
                <div className="flex-1">
                    <span className={`font-bold mr-2 ${log.sender === 'System' ? 'text-red-400' : 'text-cyan-400'}`}>[{log.sender}]:</span>
                    <span className={log.risk === 'high' ? 'text-red-300' : 'text-white/70'}>{log.text}</span>
                </div>
                </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-white/10 bg-white/5 flex justify-end gap-2">
           <Button variant="ghost" onClick={onClose} className="h-8 text-xs">Close</Button>
           <Button 
             variant="primary" 
             className="h-8 text-xs bg-red-600 hover:bg-red-700 border-none shadow-none text-white"
             onClick={() => {
               onBan(user.id);
               onClose();
             }}
           >
             Ban User
           </Button>
        </div>
      </div>
    </div>
  );
};

const RejectionModal: React.FC<{ user: User | null; onClose: () => void; onConfirm: (reason: string) => void }> = ({ user, onClose, onConfirm }) => {
  if (!user) return null;
  const reasons = ["Invalid Document", "Blurry Image", "Business Not Found", "Suspicious Activity", "Other"];
  const [selectedReason, setSelectedReason] = useState(reasons[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-xl shadow-2xl">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-mono text-sm font-bold text-white">REJECT_VERIFICATION</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-white/70">Select a reason for rejecting <span className="text-white font-bold">{user.name}</span>:</p>
          <div className="space-y-2">
            {reasons.map(r => (
              <label key={r} className="flex items-center gap-3 p-3 rounded border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                <input 
                  type="radio" 
                  name="reason" 
                  checked={selectedReason === r} 
                  onChange={() => setSelectedReason(r)}
                  className="accent-red-500"
                />
                <span className="text-sm text-white/80">{r}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="h-9">Cancel</Button>
          <Button onClick={() => onConfirm(selectedReason)} className="h-9 bg-red-500 hover:bg-red-600 border-none text-white shadow-none">Confirm Rejection</Button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER FOR MOCK DATA ---
const generateSparklineData = (base: number, variance: number) => {
  return Array.from({ length: 15 }, (_, i) => ({
    value: Math.max(0, base + Math.sin(i / 2) * variance + (Math.random() - 0.5) * variance)
  }));
};

// --- MAIN DASHBOARD COMPONENT ---

export const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'verifications' | 'reports'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Selection & Actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);
  const [showReportedOnly, setShowReportedOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Mock Sparkline Data
  const [sparklines, setSparklines] = useState<any>({});

  useEffect(() => {
    loadData();
    // Generate static random data for sparklines on mount
    setSparklines({
      users: generateSparklineData(150, 20),
      revenue: generateSparklineData(5000, 1000),
      matches: generateSparklineData(40, 10),
      verifications: generateSparklineData(10, 5)
    });
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [s, u] = await Promise.all([
      api.getAdminStats(),
      api.getAllUsers()
    ]);
    setStats(s);
    setUsers(u);
    setIsLoading(false);
  };

  const handleSeed = async () => {
    if(!window.confirm("This will inject mock data into Firestore. Continue?")) return;
    setIsSeeding(true);
    await api.seedDatabase();
    await loadData();
    setIsSeeding(false);
  };

  const handleVerify = async (userId: string, approved: boolean, reason?: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, verificationStatus: approved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED } 
        : u
    ));
    await api.verifyUser(userId, approved);
    setRejectingUser(null);
    api.getAdminStats().then(setStats); // Refresh stats
  };

  const handleBan = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: UserStatus.BANNED } : u));
    await api.updateUserStatus(userId, UserStatus.BANNED);
  };

  const handleShadowBan = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      status: u.status === UserStatus.SHADOW_BANNED ? UserStatus.ACTIVE : UserStatus.SHADOW_BANNED 
    } : u));
    // Mock API call would go here
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) setSelectedUsers(prev => prev.filter(uid => uid !== id));
    else setSelectedUsers(prev => [...prev, id]);
  };

  // Filtering Logic
  let filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleFilter !== 'ALL') {
    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
  }

  if (showUnverifiedOnly) {
    filteredUsers = filteredUsers.filter(u => u.role === UserRole.BUSINESS && u.verificationStatus !== VerificationStatus.VERIFIED);
  }

  if (showVerifiedOnly) {
    filteredUsers = filteredUsers.filter(u => u.verificationStatus === VerificationStatus.VERIFIED);
  }

  if (showReportedOnly) {
    filteredUsers = filteredUsers.filter(u => u.reportCount > 0);
  }

  const pendingUsers = users.filter(u => u.verificationStatus === VerificationStatus.PENDING);

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-black z-20"
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-white">
            <img src={APP_LOGO} className="h-8 w-auto object-contain" alt="Ping Admin" />
          </div>
          <div className="hidden lg:block">
            <span className="font-bold text-lg tracking-tight text-white">GOD_MODE</span>
            <span className="block text-[9px] text-cyan-500 font-mono tracking-widest">V2.0.4 ACCESS GRANTED</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-6">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'COCKPIT' },
            { id: 'users', icon: Users, label: 'USER_GRID' },
            { id: 'verifications', icon: CheckCircle, label: 'VERIFICATION', badge: stats?.pendingVerifications },
            { id: 'reports', icon: ShieldAlert, label: 'SAFETY_LOG' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group font-mono text-xs
                ${activeView === item.id ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-900/50' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <item.icon size={16} />
              <span className="hidden lg:block tracking-wide">{item.label}</span>
              {item.badge ? (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded text-[9px] text-white font-bold flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
           <button 
             onClick={handleSeed} 
             disabled={isSeeding}
             className="flex items-center gap-3 px-4 py-3 text-orange-500/60 hover:text-orange-500 hover:bg-orange-500/10 w-full rounded-lg transition-colors font-mono text-xs border border-transparent hover:border-orange-500/20"
           >
             {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
             <span className="hidden lg:block">{isSeeding ? 'SEEDING...' : 'SEED_DATABASE'}</span>
           </button>

           <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 w-full rounded-lg transition-colors font-mono text-xs border border-transparent hover:border-red-500/20">
             <Ban size={16} />
             <span className="hidden lg:block">TERMINATE_SESSION</span>
           </button>
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0a0a0a]">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-md z-10 shrink-0">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                 <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-bounce' : 'bg-green-500 animate-pulse'}`}></span>
                 SYSTEM STATUS: {isLoading ? 'LOADING_RESOURCES' : 'ONLINE'}
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="text-[10px] font-mono text-white/30">
                 LATENCY: 24ms
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="QUERY_DB..." 
                  className="bg-black border border-white/10 rounded-none pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 w-64 transition-all placeholder:text-white/20"
                />
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0 no-scrollbar">
          
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full text-cyan-500/50 space-y-4">
                <Loader2 size={40} className="animate-spin" />
                <p className="font-mono text-xs tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
             </div>
          ) : (
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW */}
            {activeView === 'overview' && stats && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    label="Total Users" 
                    value={stats.totalUsers} 
                    trend="+12.5%" 
                    subLabel={`${stats.split.business} BIZ / ${stats.split.influencer} INF`} 
                    color="cyan" 
                    data={sparklines.users}
                  />
                  <StatCard 
                    label="Monthly Revenue" 
                    value={`$${stats.revenue.toLocaleString()}`} 
                    trend="+8.2%" 
                    subLabel="STRIPE VOL" 
                    color="purple" 
                    data={sparklines.revenue}
                  />
                  <StatCard 
                    label="Active Matches" 
                    value={stats.activeMatches} 
                    trend="+24 today" 
                    subLabel="CONVERSATIONS" 
                    color="green" 
                    data={sparklines.matches}
                  />
                  <StatCard 
                    label="Verification Q" 
                    value={stats.pendingVerifications} 
                    subLabel="REQUIRES ACTION" 
                    color="yellow" 
                    data={sparklines.verifications}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Main Chart Placeholder */}
                   <div className="lg:col-span-2 p-6 min-h-[400px] flex flex-col bg-black/40 border border-white/10 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50"></div>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="font-mono font-bold text-sm text-white">GROWTH_METRICS</h3>
                        <div className="flex gap-1">
                           {['1D', '1W', '1M', '1Y'].map(t => (
                             <button key={t} className="text-[10px] font-mono px-3 py-1 rounded-sm bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30 transition-all text-white/50">{t}</button>
                           ))}
                        </div>
                      </div>
                      <div className="flex-1 flex items-end gap-1 px-2 border-b border-white/5 pb-2">
                         {[30, 45, 35, 60, 55, 70, 85, 80, 95, 100, 90, 110, 95, 105, 115, 120].map((h, i) => (
                           <div key={i} className="flex-1 bg-cyan-500/20 hover:bg-cyan-400/80 transition-all duration-300 relative group" style={{ height: `${h * 0.7}%` }}>
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[9px] px-2 py-1 border border-cyan-500/30 text-cyan-400 font-mono whitespace-nowrap z-10 pointer-events-none">
                                DATA: {h * 12}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Activity Feed */}
                   <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h3 className="font-mono font-bold text-sm text-white">SYSTEM_LOGS</h3>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1 p-0 overflow-y-auto font-mono text-xs">
                         {[1,2,3,4,5,6,7,8].map(i => (
                           <div key={i} className="flex items-start gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                             <span className="text-white/30 text-[10px] mt-0.5">09:4{i}:12</span>
                             <div>
                               <p className="text-white/80">User <span className="text-cyan-400">#8392</span> verified.</p>
                               <p className="text-[9px] text-white/30 mt-0.5">ADMIN_ACTION • IP 192.168.1.{i}</p>
                             </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* USERS TABLE */}
            {activeView === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col"
              >
                 <div className="flex-1 overflow-hidden flex flex-col bg-black/40 border border-white/10 rounded-xl">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                       <h3 className="font-mono font-bold text-sm tracking-widest text-white">DATABASE_RECORDS</h3>
                       <div className="flex gap-2">
                         <button 
                            onClick={() => {
                                const next = roleFilter === 'ALL' ? UserRole.BUSINESS : roleFilter === UserRole.BUSINESS ? UserRole.INFLUENCER : 'ALL';
                                setRoleFilter(next);
                            }}
                            className={`text-[10px] font-mono px-3 py-1.5 flex items-center gap-2 border transition-all ${roleFilter !== 'ALL' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'border-white/10 text-white/50 hover:text-white'}`}
                         >
                           {roleFilter === UserRole.BUSINESS ? <Briefcase size={12} /> : <Users size={12} />} 
                           {roleFilter === 'ALL' ? 'FILTER: ROLE' : roleFilter === UserRole.BUSINESS ? 'ROLE: BRAND' : 'ROLE: CREATOR'}
                         </button>
                         <button 
                            onClick={() => {
                                setShowReportedOnly(!showReportedOnly);
                                if (!showReportedOnly) {
                                    setShowUnverifiedOnly(false);
                                }
                            }}
                            className={`text-[10px] font-mono px-3 py-1.5 flex items-center gap-2 border transition-all ${showReportedOnly ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'border-white/10 text-white/50 hover:text-white'}`}
                         >
                           <AlertTriangle size={12} /> {showReportedOnly ? 'FILTER: REPORTED' : 'SHOW REPORTED'}
                         </button>
                         <button 
                            onClick={() => {
                                setShowVerifiedOnly(!showVerifiedOnly);
                                if (!showVerifiedOnly) setShowUnverifiedOnly(false);
                            }}
                            className={`text-[10px] font-mono px-3 py-1.5 flex items-center gap-2 border transition-all ${showVerifiedOnly ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'border-white/10 text-white/50 hover:text-white'}`}
                         >
                           <ShieldCheck size={12} /> {showVerifiedOnly ? 'FILTER: VERIFIED' : 'SHOW VERIFIED'}
                         </button>
                         <button 
                            onClick={() => {
                                setShowUnverifiedOnly(!showUnverifiedOnly);
                                if (!showUnverifiedOnly) {
                                    setShowReportedOnly(false);
                                    setShowVerifiedOnly(false);
                                }
                            }}
                            className={`text-[10px] font-mono px-3 py-1.5 flex items-center gap-2 border transition-all ${showUnverifiedOnly ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' : 'border-white/10 text-white/50 hover:text-white'}`}
                         >
                           <Filter size={12} /> {showUnverifiedOnly ? 'FILTER: UNVERIFIED BIZ' : 'FILTER: UNVERIFIED'}
                         </button>
                       </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-black sticky top-0 z-10">
                          <tr>
                            <th className="p-4 border-b border-white/10 w-10">
                              <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} className="accent-cyan-500 bg-transparent border-white/20" />
                            </th>
                            <th className="p-4 border-b border-white/10 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest font-normal">Entity</th>
                            <th className="p-4 border-b border-white/10 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest font-normal">Role</th>
                            <th className="p-4 border-b border-white/10 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest font-normal">AI Score</th>
                            <th className="p-4 border-b border-white/10 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest font-normal">Status</th>
                            <th className="p-4 border-b border-white/10 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest font-normal">Verification</th>
                            <th className="p-4 border-b border-white/10 text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest font-normal text-right">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs font-mono">
                          {filteredUsers.map(user => (
                            <tr key={user.id} className={`hover:bg-cyan-500/5 transition-colors group ${selectedUsers.includes(user.id) ? 'bg-cyan-500/10' : ''}`}>
                              <td className="p-4">
                                <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="accent-cyan-500" />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-white/10 overflow-hidden relative">
                                    <img src={user.avatar} className="w-full h-full object-cover opacity-80" />
                                    {user.status === UserStatus.SHADOW_BANNED && (
                                      <div className="absolute inset-0 bg-purple-500/50 flex items-center justify-center">
                                        <EyeOff size={14} className="text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white tracking-tight flex items-center gap-2">
                                        {user.name}
                                        {user.reportCount > 0 && (
                                            <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1">
                                                <AlertTriangle size={8} /> {user.reportCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-white/30">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] px-1.5 py-0.5 border ${user.role === UserRole.BUSINESS ? 'border-blue-500/30 text-blue-400' : 'border-purple-500/30 text-purple-400'}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-4">
                                {user.aiMatchScore ? (
                                  <div className="flex items-center gap-2">
                                     <span className={`font-mono text-xs ${user.aiMatchScore > 80 ? 'text-green-400' : 'text-white/60'}`}>{user.aiMatchScore}%</span>
                                     <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${user.aiMatchScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${user.aiMatchScore}%` }}></div>
                                     </div>
                                  </div>
                                ) : (
                                  <span className="font-mono text-xs text-white/20">N/A</span>
                                )}
                              </td>
                              <td className="p-4">
                                <StatusBadge status={user.status} />
                              </td>
                              <td className="p-4">
                                <StatusBadge status={user.verificationStatus} />
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => setInspectingUser(user)}
                                     className="p-1.5 hover:bg-cyan-500/20 rounded text-cyan-500/60 hover:text-cyan-400" 
                                     title="Inspect Messages"
                                   >
                                      <MessageSquare size={14} />
                                   </button>
                                   <button 
                                     onClick={() => handleShadowBan(user.id)}
                                     className={`p-1.5 hover:bg-purple-500/20 rounded transition-colors ${user.status === UserStatus.SHADOW_BANNED ? 'text-purple-400 bg-purple-500/10' : 'text-purple-500/60 hover:text-purple-400'}`}
                                     title="Shadow Ban"
                                   >
                                      <EyeOff size={14} />
                                   </button>
                                   <button 
                                     onClick={() => handleBan(user.id)}
                                     className="p-1.5 hover:bg-red-500/20 rounded text-red-500/60 hover:text-red-500" 
                                     title="Ban User"
                                    >
                                      <Ban size={14} />
                                   </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Action Dock */}
                    <AnimatePresence>
                      {selectedUsers.length > 0 && (
                        <motion.div 
                          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#09090b] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] rounded-full px-6 py-3 flex items-center gap-4 z-30"
                        >
                          <span className="text-xs font-mono text-cyan-400">{selectedUsers.length} SELECTED</span>
                          <div className="h-4 w-px bg-white/10"></div>
                          <button className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-2"><CheckCircle size={14} /> VERIFY</button>
                          <button className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-2"><EyeOff size={14} /> SHADOW</button>
                          <button className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-2"><Trash2 size={14} /> DELETE</button>
                          <button onClick={() => setSelectedUsers([])} className="ml-2 p-1 hover:bg-white/10 rounded-full"><X size={14} /></button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </motion.div>
            )}

            {/* VERIFICATION QUEUE */}
            {activeView === 'verifications' && (
              <motion.div
                key="verifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {pendingUsers.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-30">
                    <CheckCircle size={64} className="text-green-500 mb-6" />
                    <h2 className="text-2xl font-mono font-bold tracking-widest">QUEUE_EMPTY</h2>
                    <p className="font-mono text-sm mt-2">ALL TASKS COMPLETED</p>
                  </div>
                ) : (
                  pendingUsers.map(user => (
                    <div key={user.id} className="relative bg-black/40 border border-white/10 rounded-xl overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                       <div className="p-6 flex flex-col gap-6">
                           <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                 <img src={user.avatar} className="w-16 h-16 rounded object-cover border border-white/10" />
                                 <div>
                                   <h3 className="font-bold text-white text-lg tracking-tight">{user.name}</h3>
                                   <p className="text-xs font-mono text-white/50">{user.email}</p>
                                   <div className="mt-2"><StatusBadge status="PENDING_REVIEW" /></div>
                                 </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-mono text-white/30">REQ_ID</div>
                                <div className="font-mono text-white/60">#{user.id.slice(0,6).toUpperCase()}</div>
                              </div>
                           </div>

                           <div className="bg-[#050505] border border-white/10 rounded p-4">
                              <div className="flex justify-between items-center mb-3">
                                 <span className="text-[10px] font-mono font-bold text-white/40 uppercase flex items-center gap-2">
                                   <FileText size={12} /> Supporting_Doc_01.pdf
                                 </span>
                                 <a href="#" className="text-[10px] font-mono text-cyan-400 hover:underline">OPEN_SOURCE</a>
                              </div>
                              {user.docUrl ? (
                                 <div className="relative h-40 group-hover:h-64 transition-all duration-500 overflow-hidden rounded border border-white/5">
                                    <img src={user.docUrl} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                                 </div>
                              ) : (
                                 <div className="h-32 flex items-center justify-center border border-white/5 border-dashed rounded text-white/20 font-mono text-xs">
                                   NO_PREVIEW_AVAILABLE
                                 </div>
                              )}
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => setRejectingUser(user)}
                                className="flex items-center justify-center gap-2 py-3 rounded bg-red-500/5 border border-red-500/20 text-red-500 font-mono text-xs font-bold hover:bg-red-500/10 transition-all"
                              >
                                 <X size={14} /> REJECT
                              </button>
                              <button 
                                 onClick={() => handleVerify(user.id, true)}
                                 className="flex items-center justify-center gap-2 py-3 rounded bg-green-500/5 border border-green-500/20 text-green-500 font-mono text-xs font-bold hover:bg-green-500/10 transition-all shadow-[0_0_15px_rgba(34,197,94,0.05)]"
                              >
                                 <Check size={14} /> APPROVE
                              </button>
                           </div>
                       </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Reports */}
            {activeView === 'reports' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-white/20">
                 <ShieldAlert size={64} className="mb-4" />
                 <p className="font-mono text-sm tracking-widest">SYSTEM_SECURE</p>
                 <p className="font-mono text-xs mt-2">NO CRITICAL ALERTS LOGGED</p>
              </motion.div>
            )}
            
          </AnimatePresence>
          )}
        </div>
        
        {/* Render Modals */}
        <AnimatePresence>
          {inspectingUser && (
            <MessageInspectorModal 
              user={inspectingUser} 
              onClose={() => setInspectingUser(null)} 
              onBan={handleBan}
            />
          )}
          {rejectingUser && (
            <RejectionModal 
              user={rejectingUser} 
              onClose={() => setRejectingUser(null)} 
              onConfirm={(reason) => handleVerify(rejectingUser.id, false, reason)} 
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
