
import React, { useState, useEffect, useRef } from 'react';
import { Match, Message, Contract } from '../types';
import { api } from '../services/mockService';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Send, Phone, Video, ImagePlus, Smile, FileText, Check, Lock, Briefcase, Sparkles, X, DollarSign, Clock, Calendar, CheckCircle2, XCircle, ChevronRight, AlertCircle, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import confetti from 'canvas-confetti';

interface ChatInterfaceProps {
  match: Match;
  onBack: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

// Deal Stages
type DealStage = 'NONE' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'AGREED' | 'ESCROW_FUNDED' | 'WORK_SUBMITTED' | 'COMPLETED';

// --- SUB-COMPONENTS ---

const DealWorkflowHeader: React.FC<{ 
  stage: DealStage; 
  dealValue?: string; 
  onAction: () => void; 
}> = ({ stage, dealValue, onAction }) => {
  if (stage === 'NONE') return null;

  const steps = [
    { id: 'PROPOSAL_SENT', label: 'Offer', icon: FileText },
    { id: 'AGREED', label: 'Contract', icon: CheckCircle2 },
    { id: 'ESCROW_FUNDED', label: 'Escrow', icon: Lock },
    { id: 'COMPLETED', label: 'Done', icon: Sparkles },
  ];

  // Helper to determine step status
  const getStepStatus = (stepId: string) => {
    const order = ['NONE', 'PROPOSAL_SENT', 'NEGOTIATION', 'AGREED', 'ESCROW_FUNDED', 'WORK_SUBMITTED', 'COMPLETED'];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);
    
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  const config = {
    'PROPOSAL_SENT': {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'Proposal Pending',
      subtext: 'Waiting for response...',
      action: 'View Offer',
      color: 'text-blue-500'
    },
    'NEGOTIATION': {
      bg: 'bg-orange-500/10 border-orange-500/20',
      text: 'Negotiating Terms',
      subtext: 'Review counter-offer',
      action: 'Review',
      color: 'text-orange-500'
    },
    'AGREED': {
      bg: 'bg-green-500/10 border-green-500/20',
      text: 'Offer Accepted',
      subtext: 'Waiting for funding',
      action: 'Fund Escrow',
      color: 'text-green-500'
    },
    'ESCROW_FUNDED': {
      bg: 'bg-purple-500/10 border-purple-500/20',
      text: 'Active Collaboration',
      subtext: 'Funds secured in escrow',
      action: 'Submit Work',
      color: 'text-purple-500'
    },
    'WORK_SUBMITTED': {
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      text: 'Work Submitted',
      subtext: 'Review deliverables',
      action: 'Release Funds',
      color: 'text-yellow-500'
    },
    'COMPLETED': {
      bg: 'bg-green-500/10 border-green-500/20',
      text: 'Campaign Completed',
      subtext: 'Payment released',
      action: 'View Receipt',
      color: 'text-green-500'
    }
  };

  const currentConfig = config[stage as keyof typeof config] || config['PROPOSAL_SENT'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 mt-2 p-3 rounded-2xl border backdrop-blur-md shadow-sm ${currentConfig.bg}`}
    >
      {/* Progress Stepper */}
      <div className="flex justify-between items-center mb-3 px-2 relative">
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -z-10" />
         {steps.map((s, i) => {
           const status = getStepStatus(s.id);
           return (
             <div key={s.id} className="flex flex-col items-center gap-1 bg-white dark:bg-[#0f0c29] p-1 rounded-full z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${status === 'completed' ? 'bg-green-500 text-white' : status === 'active' ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-white/20 text-gray-400'}`}>
                   {status === 'completed' ? <Check size={12} /> : <s.icon size={12} />}
                </div>
             </div>
           );
         })}
      </div>

      <div className="flex justify-between items-center pl-1">
         <div>
            <div className="flex items-center gap-2">
               <h4 className={`text-sm font-bold ${currentConfig.color}`}>{currentConfig.text}</h4>
               {dealValue && <span className="text-xs font-mono bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-white/80">${dealValue}</span>}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/50">{currentConfig.subtext}</p>
         </div>
         <button 
           onClick={onAction}
           className="bg-white dark:bg-white/10 text-gray-900 dark:text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-transform border border-black/5 dark:border-white/10"
         >
            {currentConfig.action}
         </button>
      </div>
    </motion.div>
  );
};

// Quick Proposal Modal
const ProposalModal: React.FC<{ onClose: () => void; onSend: (data: {title: string, price: string, deadline: string}) => void }> = ({ onClose, onSend }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(title && price && deadline) {
      onSend({ title, price, deadline });
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-r from-pink-600 to-orange-500 p-6 text-white flex justify-between items-center">
           <h3 className="text-xl font-bold flex items-center gap-2"><Briefcase size={20} /> Create Proposal</h3>
           <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6">
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deliverable</label>
                 <input 
                   type="text" 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="e.g. 1 Instagram Reel + 3 Stories"
                   className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50"
                   required
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price ($)</label>
                    <div className="relative">
                       <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                       <input 
                         type="number" 
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         placeholder="500"
                         className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50"
                         required
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deadline</label>
                    <div className="relative">
                       <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                       <input 
                         type="text" 
                         value={deadline}
                         onChange={(e) => setDeadline(e.target.value)}
                         placeholder="7 Days"
                         className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50"
                         required
                       />
                    </div>
                 </div>
              </div>
              
              <div className="pt-4">
                 <Button fullWidth type="submit">Send Proposal</Button>
              </div>
           </form>
        </div>
      </motion.div>
    </div>
  );
};

// Existing Contract Modal
const ContractModal: React.FC<{ contract: Contract; onClose: () => void }> = ({ contract, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
       >
         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md"><Briefcase size={20} /></div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><ArrowLeft size={20} /></button>
            </div>
            <h3 className="text-xl font-bold">{contract.title}</h3>
            <p className="opacity-80 text-sm">Escrow Secure ID: #{contract.id}</p>
         </div>
         
         <div className="p-6">
            <div className="flex justify-between items-end mb-6">
               <span className="text-sm text-gray-500 dark:text-white/50 font-bold uppercase tracking-wider">Total Value</span>
               <span className="text-3xl font-bold text-gray-900 dark:text-white">${contract.totalAmount.toLocaleString()}</span>
            </div>

            <div className="space-y-4 relative">
               <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-white/10"></div>
               {contract.milestones.map((ms, i) => (
                  <div key={ms.id} className="relative flex items-center gap-4">
                     <div className={`z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${ms.status === 'PAID' ? 'bg-green-500 border-green-500 text-white' : ms.status === 'LOCKED' ? 'bg-gray-200 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-400' : 'bg-white dark:bg-[#1a1a1a] border-blue-500 text-blue-500'}`}>
                        {ms.status === 'PAID' ? <Check size={12} /> : ms.status === 'LOCKED' ? <Lock size={12} /> : <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                     </div>
                     <div className="flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 flex justify-between items-center">
                        <div>
                           <p className="text-sm font-bold text-gray-900 dark:text-white">{ms.title}</p>
                           <p className="text-xs text-gray-500 dark:text-white/50 font-mono">${ms.amount}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${ms.status === 'PAID' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : ms.status === 'LOCKED' ? 'text-gray-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                           {ms.status}
                        </span>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-8">
               <Button fullWidth variant="secondary" onClick={onClose}>Close Contract</Button>
            </div>
         </div>
       </motion.div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ match, onBack, isPremium, onUpgrade }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // AI State
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);

  // Deal Room State
  const [dealStage, setDealStage] = useState<DealStage>('NONE');
  const [dealValue, setDealValue] = useState<string | undefined>(undefined);
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadContract();
    if (messages.length < 2) {
      loadIcebreakers();
    }
  }, [match.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadIcebreakers = async () => {
    setLoadingIcebreakers(true);
    // Assuming current user has a role inverse to the match for context
    const currentUserRole = match.userProfile.role === 'INFLUENCER' ? 'BUSINESS' : 'INFLUENCER'; 
    const suggestions = await geminiService.generateIcebreakers(
      match.userProfile.name, 
      match.userProfile.tags, 
      currentUserRole as any
    );
    setIcebreakers(suggestions);
    setLoadingIcebreakers(false);
  };

  const loadMessages = async () => {
    setLoading(true);
    const msgs = await api.getMessages(match.id);
    setMessages(msgs);
    // Check messages for latest proposal status to set initial deal stage
    const lastProposal = [...msgs].reverse().find(m => m.type === 'proposal');
    if (lastProposal && lastProposal.proposalData) {
       if (lastProposal.proposalData.status === 'ACCEPTED') {
          setDealStage('AGREED');
          setDealValue(lastProposal.proposalData.price);
       } else if (lastProposal.proposalData.status === 'PENDING') {
          setDealStage('PROPOSAL_SENT');
          setDealValue(lastProposal.proposalData.price);
       }
    }
    setLoading(false);
  };

  const loadContract = async () => {
     const c = await api.getContract(match.id);
     setContract(c);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user-123',
      text: inputText,
      timestamp: Date.now(),
      read: false
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputText('');
    await api.sendMessage(match.id, optimisticMessage.text);
  };

  const handleSendProposal = async (data: { title: string, price: string, deadline: string }) => {
    setShowProposalModal(false);
    
    // Update Deal Stage
    setDealStage('PROPOSAL_SENT');
    setDealValue(data.price);
    
    const proposalText = `📋 PROPOSAL: ${data.title} for $${data.price} (Due: ${data.deadline})`;
    
    const optimisticMessage: Message = {
        id: Date.now().toString(),
        senderId: 'current-user-123',
        text: proposalText,
        timestamp: Date.now(),
        read: false,
        type: 'proposal',
        proposalData: { ...data, status: 'PENDING' }
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    await api.sendMessage(match.id, proposalText);
  };

  const handleProposalAction = (msgId: string, action: 'ACCEPTED' | 'DECLINED') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.proposalData) {
        return {
          ...msg,
          proposalData: {
            ...msg.proposalData,
            status: action
          }
        };
      }
      return msg;
    }));

    if (action === 'ACCEPTED') {
      setDealStage('AGREED');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ffffff', '#86efac'] 
      });
      // Simulate progression to Escrow Funded after 2s
      setTimeout(() => setDealStage('ESCROW_FUNDED'), 3000);
    } else {
      setDealStage('NONE');
    }
  };

  const handleDealHeaderAction = () => {
     if (dealStage === 'PROPOSAL_SENT' || dealStage === 'NEGOTIATION') {
        // Find the proposal message to view details (simplified: just alerting for demo)
        alert("Opening latest proposal details...");
     } else if (dealStage === 'AGREED') {
        alert("Redirecting to Payment Gateway to fund escrow...");
     } else if (dealStage === 'ESCROW_FUNDED') {
        alert("Upload deliverables form...");
     } else if (dealStage === 'COMPLETED') {
        setShowContract(true);
     }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-[#0f0c29] flex flex-col h-[100dvh] transition-colors duration-300"
    >
      {/* Aurora Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/20 to-brand-dark z-0 pointer-events-none opacity-0 dark:opacity-100"></div>

      {/* Header */}
      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border-b border-pink-100 dark:border-white/5 p-4 flex items-center justify-between shrink-0 safe-top pt-safe z-10 relative">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-white/80 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={match.userProfile.avatar} 
                alt={match.userProfile.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-white/10" 
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#0f0c29]"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-base text-gray-900 dark:text-white">{match.userProfile.name}</h3>
                 {/* AI Score Badge in Chat */}
                 {match.userProfile.aiMatchScore && (
                    isPremium ? (
                       <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 flex items-center gap-1">
                          <Sparkles size={8} /> {match.userProfile.aiMatchScore}%
                       </span>
                    ) : (
                       <button onClick={onUpgrade} className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded border border-transparent hover:border-pink-500/50 hover:text-pink-500 transition-colors flex items-center gap-1">
                          <Lock size={8} /> AI
                       </button>
                    )
                 )}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/50">Online Now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400 dark:text-white/60">
           {/* Contract Button */}
          <button 
             onClick={() => setShowContract(true)} 
             className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
             title="View Contract"
          >
             <FileText size={22} />
          </button>
          <button 
             onClick={() => setShowProposalModal(true)} 
             className="p-2 rounded-full hover:bg-green-500/10 hover:text-green-500 dark:hover:text-green-400 transition-colors"
             title="Create Proposal"
          >
             <Briefcase size={22} />
          </button>
        </div>
      </div>

      {/* SMART DEAL HEADER */}
      <AnimatePresence>
         {dealStage !== 'NONE' && (
           <DealWorkflowHeader 
              stage={dealStage} 
              dealValue={dealValue} 
              onAction={handleDealHeaderAction} 
           />
         )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10">
        
        {/* AI Icebreakers - Show only if few messages */}
        {messages.length < 2 && !loading && (
            <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-500 uppercase tracking-wider justify-center mb-3">
                    <Sparkles size={12} /> AI Suggested Icebreakers
                </div>
                {loadingIcebreakers ? (
                   <div className="flex justify-center">
                      <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                   </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                      {icebreakers.length > 0 ? icebreakers.map((text, i) => (
                          <button 
                              key={i} 
                              onClick={() => setInputText(text)}
                              className="bg-white/40 dark:bg-white/5 hover:bg-pink-500/10 border border-white/20 dark:border-white/10 hover:border-pink-500/30 rounded-xl px-4 py-2 text-sm text-pink-900/70 dark:text-white/80 transition-all text-center max-w-xs"
                          >
                              "{text}"
                          </button>
                      )) : (
                        <p className="text-xs text-white/30">No suggestions available.</p>
                      )}
                  </div>
                )}
            </div>
        )}

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-6 h-6 border-2 border-pink-500/50 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === 'current-user-123';
            const isProposal = msg.type === 'proposal' || (msg.text.includes('PROPOSAL:'));
            const status = msg.proposalData?.status || 'PENDING';

            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                 <div 
                   className={`
                     max-w-[85%] text-[15px] leading-relaxed shadow-sm overflow-hidden
                     ${isProposal 
                        ? 'bg-[#1a1a1a] border border-green-500/30 text-white rounded-2xl w-full max-w-xs'
                        : isMe 
                            ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white rounded-2xl rounded-tr-sm px-5 py-3' 
                            : 'bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-2xl rounded-tl-sm border border-pink-100 dark:border-transparent px-5 py-3'}
                   `}
                 >
                   {isProposal ? (
                       <div className={`p-4 transition-opacity duration-300 ${status === 'DECLINED' ? 'opacity-50 grayscale' : ''}`}>
                           <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
                               <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                                   <Briefcase size={14} /> Proposal
                               </div>
                               {status === 'ACCEPTED' && <span className="text-[10px] font-bold bg-green-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> ACTIVE</span>}
                               {status === 'DECLINED' && <span className="text-[10px] font-bold bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle size={10} /> DECLINED</span>}
                           </div>
                           
                           {msg.proposalData ? (
                               <div className="space-y-2">
                                   <p className="font-bold text-lg leading-tight">{msg.proposalData.title}</p>
                                   <div className="flex gap-4 text-sm text-white/70 bg-white/5 p-2 rounded-lg">
                                       <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-green-400" /> {msg.proposalData.price}</span>
                                       <span className="w-px h-4 bg-white/10"></span>
                                       <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-400" /> {msg.proposalData.deadline}</span>
                                   </div>
                               </div>
                           ) : (
                               <p>{msg.text}</p>
                           )}
                           
                           {status === 'PENDING' && (
                               <div className="mt-4 pt-2 border-t border-white/10 flex gap-2">
                                   <button 
                                     onClick={() => handleProposalAction(msg.id, 'ACCEPTED')}
                                     className="flex-1 bg-green-500 text-black text-xs font-bold py-2.5 rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                                   >
                                     ACCEPT DEAL
                                   </button>
                                   <button 
                                     onClick={() => handleProposalAction(msg.id, 'DECLINED')}
                                     className="flex-1 bg-white/10 text-white/70 text-xs font-bold py-2.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors"
                                   >
                                     DECLINE
                                   </button>
                               </div>
                           )}
                       </div>
                   ) : msg.text}
                 </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/90 dark:bg-white/5 backdrop-blur-xl shrink-0 safe-bottom border-t border-pink-100 dark:border-white/5 relative z-10 transition-colors">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button type="button" className="p-2 text-gray-400 dark:text-white/40 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
            <ImagePlus size={24} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Say something nice..."
              className="w-full bg-white dark:bg-white/10 border border-pink-100 dark:border-transparent focus:border-pink-500/50 rounded-full pl-5 pr-10 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/15 transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white">
              <Smile size={20} />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-all"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
      </div>

      <AnimatePresence>
        {showContract && contract && (
           <ContractModal contract={contract} onClose={() => setShowContract(false)} />
        )}
        {showProposalModal && (
           <ProposalModal onClose={() => setShowProposalModal(false)} onSend={handleSendProposal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
