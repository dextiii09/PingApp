import React, { useState, useEffect, useRef } from 'react';
import { Match, Message, Contract, User, UserRole } from '../types';
import { api } from '../services/firebaseService';
import { geminiService } from '../services/geminiService';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../services/firebaseConfig';
import { ArrowLeft, Send, Phone, Video, ImagePlus, Smile, FileText, Check, Lock, Briefcase, Sparkles, X, IndianRupee, Clock, Calendar, CheckCircle2, XCircle, ChevronRight, AlertCircle, Wallet, PlayCircle, Globe, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import confetti from 'canvas-confetti';

interface ChatInterfaceProps {
  match: Match;
  currentUser: User;
  onBack: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

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

  const getStepStatus = (stepId: string) => {
    const order = ['NONE', 'PROPOSAL_SENT', 'NEGOTIATION', 'AGREED', 'ESCROW_FUNDED', 'WORK_SUBMITTED', 'COMPLETED'];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  const config = {
    'PROPOSAL_SENT': { bg: 'bg-blue-500/10 border-blue-500/20', text: 'Proposal Pending', subtext: 'Waiting for response...', action: 'View Offer', color: 'text-blue-500' },
    'NEGOTIATION': { bg: 'bg-orange-500/10 border-orange-500/20', text: 'Negotiating Terms', subtext: 'Review counter-offer', action: 'Review', color: 'text-orange-500' },
    'AGREED': { bg: 'bg-green-500/10 border-green-500/20', text: 'Offer Accepted', subtext: 'Waiting for funding', action: 'Fund Escrow', color: 'text-green-500' },
    'ESCROW_FUNDED': { bg: 'bg-purple-500/10 border-purple-500/20', text: 'Active Collaboration', subtext: 'Funds secured in escrow', action: 'Submit Work', color: 'text-purple-500' },
    'WORK_SUBMITTED': { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'Work Submitted', subtext: 'Review deliverables', action: 'Release Funds', color: 'text-yellow-500' },
    'COMPLETED': { bg: 'bg-green-500/10 border-green-500/20', text: 'Campaign Completed', subtext: 'Payment released', action: 'View Receipt', color: 'text-green-500' }
  };

  const currentConfig = config[stage as keyof typeof config] || config['PROPOSAL_SENT'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 mt-2 p-3 rounded-2xl border backdrop-blur-md shadow-sm ${currentConfig.bg} relative z-20`}
    >
      <div className="flex justify-between items-center mb-3 px-2 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -z-10" />
        {steps.map((s) => {
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
            {dealValue && <span className="text-xs font-mono bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-600 dark:text-white/80">₹{dealValue}</span>}
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

const ProposalModal: React.FC<{ onClose: () => void; onSend: (data: { title: string, price: string, deadline: string, description: string }) => void }> = ({ onClose, onSend }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && price && deadline) onSend({ title, price, deadline, description });
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-pink-600 to-orange-500 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2"><Briefcase size={20} /> Create Proposal</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deliverable</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 1 Instagram Reel + 3 Stories" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Terms of the deal..." className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 h-24 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (₹)</label>
                <div className="relative"><IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500" className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50" required /></div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deadline</label>
                <div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="7 Days" className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-pink-500/50" required /></div>
              </div>
            </div>
            <div className="pt-4"><Button fullWidth type="submit">Send Proposal</Button></div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const ContractModal: React.FC<{
  contract: Contract;
  onClose: () => void;
  onFund: () => void;
  onRelease: (id: string) => void;
  onSubmitWork: (id: string, url: string) => void;
  onRequestRevision: (id: string, feedback: string) => void;
  userRole: UserRole;
}> = ({ contract, onClose, onFund, onRelease, onSubmitWork, onRequestRevision, userRole }) => {
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [activeAction, setActiveAction] = useState<{ type: 'SUBMIT' | 'REVISION', id: string } | null>(null);

  const isBrand = userRole === UserRole.BUSINESS;
  const firstMilestone = contract.milestones[0];
  const canFund = isBrand && firstMilestone?.status === 'LOCKED';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
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
            <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{contract.totalAmount.toLocaleString()}</span>
          </div>
          <div className="space-y-4 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-white/10"></div>
            {contract.milestones.map((ms) => (
              <div key={ms.id} className="relative flex items-center gap-4 text-left">
                <div className={`z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${ms.status === 'PAID' ? 'bg-green-500 border-green-500 text-white' : ms.status === 'LOCKED' ? 'bg-gray-200 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-400' : 'bg-white dark:bg-[#1a1a1a] border-blue-500 text-blue-500 animate-pulse'}`}>
                  {ms.status === 'PAID' ? <Check size={12} /> : ms.status === 'ESCROWED' ? <Lock size={12} /> : <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{ms.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50 font-mono">₹{ms.amount}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${ms.status === 'PAID' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        ms.status === 'UNDER_REVIEW' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                          ms.status === 'REVISION_REQUESTED' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                            ms.status === 'ESCROWED' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                              'text-gray-400'}`}>{ms.status.replace('_', ' ')}</span>
                      {isBrand && ms.status === 'UNDER_REVIEW' && (
                        <button onClick={() => onRelease(ms.id)} className="text-[9px] font-bold text-blue-500 hover:underline">Approve & Pay</button>
                      )}
                      {!isBrand && (ms.status === 'ESCROWED' || ms.status === 'REVISION_REQUESTED') && (
                        <button
                          onClick={() => setActiveAction({ type: 'SUBMIT', id: ms.id })}
                          className={`text-[9px] font-bold text-blue-500 hover:underline ${activeAction?.type === 'SUBMIT' && activeAction.id === ms.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submission Input UI */}
                  {activeAction?.type === 'SUBMIT' && activeAction.id === ms.id && (
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                      <input
                        type="url"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                        placeholder="Link to content (Drive/Insta/YT)"
                        className="w-full bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (submissionUrl) {
                              onSubmitWork(ms.id, submissionUrl);
                              setActiveAction(null);
                              setSubmissionUrl('');
                            }
                          }}
                          className="flex-1 bg-blue-600 text-white text-[10px] py-1.5 rounded-lg font-bold"
                        >
                          Send Draft
                        </button>
                        <button onClick={() => setActiveAction(null)} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-[10px] py-1.5 rounded-lg font-bold">Cancel</button>
                      </div>
                    </div>
                  )}

                  {ms.status === 'UNDER_REVIEW' && ms.contentUrl && (
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        {ms.contentUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                          <img src={ms.contentUrl} alt="Submission" className="w-full h-full object-cover" />
                        ) : ms.contentUrl.includes('youtube.com') || ms.contentUrl.includes('youtu.be') ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white flex-col gap-2">
                            <PlayCircle size={32} className="text-red-500" />
                            <span className="text-[10px] font-bold">YouTube Content</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-gray-400 flex-col gap-2">
                            <Globe size={32} />
                            <span className="text-[10px] font-bold">External Content Link</span>
                          </div>
                        )}
                        <a
                          href={ms.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group"
                        >
                          <div className="hidden group-hover:flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-full text-[10px] font-bold shadow-xl">
                            <Search size={12} /> View Full
                          </div>
                        </a>
                      </div>

                      {isBrand && (
                        <button
                          onClick={() => setActiveAction({ type: 'REVISION', id: ms.id })}
                          className={`text-[9px] font-bold text-red-500 hover:underline ${activeAction?.type === 'REVISION' && activeAction.id === ms.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          Request Revision
                        </button>
                      )}
                    </div>
                  )}

                  {/* Revision Input UI */}
                  {activeAction?.type === 'REVISION' && activeAction.id === ms.id && (
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                      <textarea
                        value={revisionFeedback}
                        onChange={(e) => setRevisionFeedback(e.target.value)}
                        placeholder="What needs to be changed?"
                        className="w-full bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500 min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (revisionFeedback) {
                              onRequestRevision(ms.id, revisionFeedback);
                              setActiveAction(null);
                              setRevisionFeedback('');
                            }
                          }}
                          className="flex-1 bg-red-600 text-white text-[10px] py-1.5 rounded-lg font-bold"
                        >
                          Submit Feedback
                        </button>
                        <button onClick={() => setActiveAction(null)} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-[10px] py-1.5 rounded-lg font-bold">Cancel</button>
                      </div>
                    </div>
                  )}

                  {ms.status === 'REVISION_REQUESTED' && ms.feedback && (
                    <div className="pt-2 border-t border-red-500/10 bg-red-500/5 p-2 rounded-lg">
                      <p className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 uppercase tracking-wide"><AlertCircle size={10} /> Feedback</p>
                      <p className="text-[11px] text-gray-600 dark:text-white/70 italic mt-0.5">"{ms.feedback}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {canFund && (
              <Button fullWidth onClick={onFund} className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                Fund Escrow (₹{contract.totalAmount.toLocaleString()})
              </Button>
            )}
            <Button fullWidth variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ match, currentUser, onBack, isPremium, onUpgrade }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dealStage, setDealStage] = useState<DealStage>('NONE');
  const [dealValue, setDealValue] = useState<string | undefined>(undefined);
  const [contract, setContract] = useState<Contract | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    // Real-time subscription
    const unsubscribe = api.subscribeToMessages(match.id, (msgs) => {
      setMessages(msgs);
      setLoading(false);

      // Update deal UI based on the latest proposal message found
      const lastProposal = [...msgs].reverse().find(m => m.type === 'proposal');
      if (lastProposal && lastProposal.proposalData) {
        setDealValue(lastProposal.proposalData.price);
        if (lastProposal.proposalData.status === 'ACCEPTED') {
          // Check if contract exists to refine stage
          api.getContract(match.id).then(c => {
            if (c) {
              const hasPaid = c.milestones.some(m => m.status === 'PAID');
              const hasEscrowed = c.milestones.some(m => m.status === 'ESCROWED');
              const hasReview = c.milestones.some(m => m.status === 'UNDER_REVIEW');
              if (hasPaid && c.milestones.every(m => m.status === 'PAID')) setDealStage('COMPLETED');
              else if (hasReview) setDealStage('WORK_SUBMITTED');
              else if (hasEscrowed) setDealStage('ESCROW_FUNDED');
              else setDealStage('AGREED');
            } else {
              setDealStage('AGREED');
            }
          });
        }
        else if (lastProposal.proposalData.status === 'PENDING') setDealStage('PROPOSAL_SENT');
        else if (lastProposal.proposalData.status === 'DECLINED') setDealStage('NONE');
      }
    });

    loadContract();
    loadIcebreakers();

    return () => unsubscribe();
  }, [match.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadIcebreakers = async () => {
    if (messages.length > 5) return;
    setLoadingIcebreakers(true);
    const partnerRole = match.userProfile.role === 'INFLUENCER' ? 'BUSINESS' : 'INFLUENCER';
    const suggestions = await geminiService.generateIcebreakers(match.userProfile.name, match.userProfile.tags, partnerRole as any);
    setIcebreakers(suggestions);
    setLoadingIcebreakers(false);
  };

  const loadContract = async () => { setContract(await api.getContract(match.id)); };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    try {
      await api.sendMessage(match.id, textToSend);
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Message failed to send. Please check your connection.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && match.id) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) return alert("File is too large. Max 20MB.");

      setIsUploading(true);
      try {
        const aiGuard = await geminiService.moderateMedia(file);
        if (!aiGuard.isSafe) {
          alert(`Attachment Blocked: ${aiGuard.reason || 'Content policy violation'}`);
          return;
        }

        const isVideo = file.type.startsWith('video/');
        const path = `matches/${match.id}/attachments/${Date.now()}_${file.name}`;
        const url = await api.uploadFile(file, path);

        await api.sendMessage(match.id, isVideo ? "Sent a video" : "Sent an image", {
          type: 'attachment',
          attachmentUrl: url,
          attachmentType: isVideo ? 'video' : 'image'
        });
      } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload attachment");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleSendProposal = async (data: { title: string, price: string, deadline: string, description: string }) => {
    setShowProposalModal(false);
    try {
      const receiverId = match.users.find(id => id !== currentUser.id) || '';
      await api.sendProposal(match.id, receiverId, data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProposalAction = async (msgId: string, action: 'ACCEPTED' | 'DECLINED' | 'CANCELLED') => {
    try {
      const msgData = messages.find(m => m.id === msgId);
      if (msgData && msgData.proposalId) {
        await api.updateProposalStatus(match.id, msgData.proposalId, action);

        if (action === 'ACCEPTED') {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e', '#ffffff', '#86efac'] });
        }
      }
    } catch (err) {
      console.error("Failed to update proposal", err);
    }
  };

  const handleDealHeaderAction = () => {
    if (dealStage === 'PROPOSAL_SENT' || dealStage === 'NEGOTIATION') alert("Opening latest proposal details...");
    else if (dealStage === 'AGREED' || dealStage === 'ESCROW_FUNDED' || dealStage === 'COMPLETED') setShowContract(true);
  };

  const MatchReasonBanner = () => {
    if (!match.aiMatchReason) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-md relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-2 opacity-20"><Sparkles size={40} className="text-indigo-400" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ring-1 ring-indigo-500/30 px-1.5 py-0.5 rounded">AI Match Insight</span>
          </div>
          {isPremium ? (
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 leading-snug">
              {match.aiMatchReason}
            </p>
          ) : (
            <div className="flex flex-col items-start gap-2 mt-2">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 leading-snug blur-[4px] select-none pointer-events-none opacity-50">
                This is a highly personalized reason explaining why you two are a perfect match based on data.
              </p>
              <button onClick={onUpgrade} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 backdrop-blur-md transition-colors border border-indigo-500/30">
                <Lock size={12} /> Unlock Match Insight
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-0 z-[100] bg-white dark:bg-[#0f0c29] flex flex-col h-[100dvh] transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/20 to-brand-dark z-0 pointer-events-none opacity-0 dark:opacity-100"></div>
      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border-b border-pink-100 dark:border-white/5 p-4 flex items-center justify-between shrink-0 safe-top pt-safe z-30 relative">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-white/80 transition-colors"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-3">
            <div className="relative"><img src={match.userProfile?.avatar || "https://picsum.photos/100/100"} alt={match.userProfile?.name} className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-white/10" /><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#0f0c29]"></div></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{match.userProfile?.name || "Match"}</h3>
                {match.userProfile?.aiMatchScore && (isPremium ? <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 flex items-center gap-1"><Sparkles size={8} /> {match.userProfile.aiMatchScore}%</span> : <button onClick={onUpgrade} className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded border border-transparent hover:border-pink-500/50 hover:text-pink-500 transition-colors flex items-center gap-1"><Lock size={8} /> AI</button>)}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/50">Online Now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400 dark:text-white/60">
          <button onClick={() => setShowContract(true)} className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" title="View Contract"><FileText size={22} /></button>
          <button onClick={() => setShowProposalModal(true)} className="p-2 rounded-full hover:bg-green-500/10 hover:text-green-500 dark:hover:text-green-400 transition-colors" title="Create Proposal"><Briefcase size={22} /></button>
        </div>
      </div>

      <AnimatePresence>{dealStage !== 'NONE' && <DealWorkflowHeader stage={dealStage} dealValue={dealValue} onAction={handleDealHeaderAction} />}</AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar relative z-10">
        <MatchReasonBanner />
        <div className="p-4 space-y-4">
          {messages.length < 2 && !loading && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-500 uppercase tracking-wider justify-center mb-3"><Sparkles size={12} /> AI Suggested Icebreakers</div>
              {loadingIcebreakers ? <div className="flex justify-center"><div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div> : (
                <div className="flex flex-col items-center gap-2">
                  {icebreakers.length > 0 ? (
                    icebreakers.map((text, i) => (
                      <button key={i} onClick={() => setInputText(text)} className="bg-white/40 dark:bg-white/5 hover:bg-pink-500/10 border border-white/20 dark:border-white/10 hover:border-pink-500/30 rounded-xl px-4 py-2 text-sm text-pink-900/70 dark:text-white/80 transition-all text-center max-w-xs">
                        "{text}"
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-white/30">No suggestions available.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {loading ? <div className="flex justify-center pt-20"><div className="w-6 h-6 border-2 border-pink-500/50 border-t-pink-500 rounded-full animate-spin"></div></div> : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isProposal = msg.type === 'proposal' || (msg.text.startsWith('PROPOSAL:'));
              const isContract = msg.type === 'contract' || (msg.text.startsWith('CONTRACT CREATED:'));
              const status = msg.proposalData?.status || 'PENDING';
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-[15px] leading-relaxed shadow-sm overflow-hidden ${isProposal || isContract ? 'bg-[#1a1a1a] border border-blue-500/30 text-white rounded-2xl w-full max-w-sm' : isMe ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white rounded-2xl rounded-tr-sm px-5 py-3' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-2xl rounded-tl-sm border border-pink-100 dark:border-transparent px-5 py-3'}`}>
                    {msg.type === 'attachment' ? (
                      <div className="space-y-2 relative">
                        {msg.attachmentType === 'video' ? (
                          <video src={msg.attachmentUrl} controls className="max-w-full rounded-lg max-h-64 object-contain shadow-md" />
                        ) : (
                          <img src={msg.attachmentUrl} alt="attachment" className="max-w-full rounded-lg max-h-64 object-contain shadow-md hover:scale-[1.02] cursor-pointer transition-transform" onClick={() => window.open(msg.attachmentUrl, '_blank')} />
                        )}
                      </div>
                    ) : isContract && msg.proposalData ? (
                      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 overflow-hidden transform transition-all hover:scale-[1.02] border-none shadow-xl">
                        <div className="p-4 flex gap-3 items-center border-b border-white/10 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-16 translate-x-16 pointer-events-none" />
                          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0 border border-blue-400/30">
                            <FileText size={20} className="text-blue-400" />
                          </div>
                          <div className="flex-1 relative z-10">
                            <h4 className="font-bold text-white text-sm">{msg.proposalData.title}</h4>
                            <p className="text-blue-200/60 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 mt-0.5"><Lock size={10} /> Escrow Agreement</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-3 bg-[#0f0f13]">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Total Value:</span>
                            <span className="text-white font-bold flex items-center gap-1"><IndianRupee size={14} className="text-green-400" />{msg.proposalData.price}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Timeline:</span>
                            <span className="text-white font-medium flex items-center gap-1"><Clock size={12} className="text-blue-400" /> {msg.proposalData.deadline}</span>
                          </div>
                          <button onClick={() => setShowContract(true)} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-blue-500/20">
                            View & Manage Escrow
                          </button>
                        </div>
                      </div>
                    ) : isProposal ? (
                      <div className={`p-4 transition-opacity duration-300 ${status === 'DECLINED' ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2"><div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest"><Briefcase size={14} /> Proposal</div>{status === 'ACCEPTED' && <span className="text-[10px] font-bold bg-green-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> ACTIVE</span>}{status === 'DECLINED' && <span className="text-[10px] font-bold bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle size={10} /> DECLINED</span>}</div>
                        {msg.proposalData ? (<div className="space-y-2"><p className="font-bold text-lg leading-tight">{msg.proposalData.title}</p><div className="flex gap-4 text-sm text-white/70 bg-white/5 p-2 rounded-lg"><span className="flex items-center gap-1.5"><IndianRupee size={14} className="text-green-400" /> {msg.proposalData.price}</span><span className="w-px h-4 bg-white/10"></span><span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-400" /> {msg.proposalData.deadline}</span></div></div>) : <p>{msg.text}</p>}
                        {status === 'PENDING' && !isMe && (
                          <div className="mt-4 pt-2 border-t border-white/10 flex gap-2">
                            <button onClick={() => handleProposalAction(msg.id, 'ACCEPTED')} className="flex-1 bg-green-500 text-black text-xs font-bold py-2.5 rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">ACCEPT DEAL</button>
                            <button onClick={() => handleProposalAction(msg.id, 'DECLINED')} className="flex-1 bg-white/10 text-white/70 text-xs font-bold py-2.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors">DECLINE</button>
                          </div>
                        )}
                        {status === 'PENDING' && isMe && <p className="text-[10px] text-white/40 mt-4 text-center">Waiting for brand response...</p>}
                      </div>
                    ) : msg.text}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/90 dark:bg-white/5 backdrop-blur-xl shrink-0 safe-bottom border-t border-pink-100 dark:border-white/5 relative z-30 transition-colors">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2 text-gray-400 dark:text-white/40 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
            {isUploading ? <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div> : <ImagePlus size={24} />}
          </button>
          <div className="flex-1 relative"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Say something nice..." className="w-full bg-white dark:bg-white/10 border border-pink-100 dark:border-transparent focus:border-pink-500/50 rounded-full pl-5 pr-10 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/15 transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30" /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white"><Smile size={20} /></button></div>
          <button type="submit" disabled={!inputText.trim()} className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-all"><Send size={20} className="ml-0.5" /></button>
        </form>
      </div>
      <AnimatePresence>
        {showContract && contract && (
          <ContractModal
            contract={contract}
            onClose={() => setShowContract(false)}
            userRole={currentUser.role}
            onFund={async () => {
              await api.fundEscrow(match.id);
              loadContract();
              setDealStage('ESCROW_FUNDED');
            }}
            onRelease={async (mid) => {
              await api.releaseMilestone(match.id, mid);
              loadContract();
              // Check if all paid
              const allPaid = contract.milestones.every(m => m.id === mid ? true : m.status === 'PAID');
              if (allPaid) setDealStage('COMPLETED');
            }}
            onSubmitWork={async (mid, url) => {
              await api.submitMilestoneDraft(match.id, mid, url);
              loadContract();
              setDealStage('WORK_SUBMITTED');
            }}
            onRequestRevision={async (mid, feedback) => {
              await api.requestMilestoneRevision(match.id, mid, feedback);
              loadContract();
            }}
          />
        )}
        {showProposalModal && <ProposalModal onClose={() => setShowProposalModal(false)} onSend={handleSendProposal} />}
      </AnimatePresence>
    </motion.div>
  );
};