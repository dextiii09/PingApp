import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';
import { ProfileCard } from './ProfileCard';
import { geminiService } from '../services/geminiService';
import { api } from '../services/firebaseService';
import { PLACEHOLDER_AVATAR } from '../constants';
import { 
  X, Plus, MapPin, Save, ArrowLeft, GripHorizontal, Sparkles, LayoutGrid, 
  Briefcase, Building2, GraduationCap, Globe, Instagram, Linkedin, Twitter, 
  Eye, MonitorSmartphone, CheckCircle2, Zap, IndianRupee, Users as UsersIcon,
  Video, Film, PlayCircle, Trash2, Youtube, Link, ImageIcon,
  User as UserIcon, Facebook, Loader2, Navigation, AlertCircle, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileProps {
  user: User;
  onSave: (updatedData: Partial<User>) => void;
  onCancel: () => void;
}

// --- SUB-COMPONENTS ---

const ProfileStrength: React.FC<{ user: User }> = ({ user }) => {
  // Calculation Logic - Weights redistributed after removing Voice Intro
  const criteria = [
    { label: "Display Name", met: !!user.name?.trim(), weight: 10 },
    { label: "Profile Photo", met: user.avatar && !user.avatar.includes('placeholder') && !user.avatar.includes('ui-avatars'), weight: 15 },
    { label: "Bio", met: (user.bio?.length || 0) > 20, weight: 20 },
    { label: "Interests", met: user.tags?.length > 0, weight: 10 },
    { label: "Video Pitch", met: !!user.introVideoUrl, weight: 35 }, 
    { label: "Socials", met: Object.values(user.socials || {}).some(v => !!v), weight: 10 },
  ];

  const score = criteria.reduce((acc, c) => acc + (c.met ? c.weight : 0), 0);
  const nextStep = criteria.find(c => !c.met);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-5 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden mb-6">
       <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full -ml-10 -mb-10 pointer-events-none"></div>
       
       <div className="flex items-center gap-5 relative z-10">
          <div className="relative w-16 h-16 flex-shrink-0">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path 
                  className={`${score === 100 ? 'text-green-500' : 'text-pink-500'} transition-all duration-1000 ease-out`} 
                  strokeDasharray={`${score}, 100`} 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                {score}%
             </div>
          </div>
          
          <div className="flex-1">
             <h4 className="font-bold text-lg leading-tight mb-1 flex items-center gap-2">
                {score === 100 ? "All Star Profile! 🌟" : "Profile Strength"}
                {score === 100 && <Trophy size={16} className="text-yellow-400" />}
             </h4>
             <p className="text-xs text-gray-400">
                {score === 100 
                   ? "You're fully optimized for maximum visibility." 
                   : (
                     <span>
                       Next: <span className="text-white font-semibold">{nextStep?.label || "Complete details"}</span> 
                       <span className="text-green-400 ml-1">(+{nextStep?.weight}%)</span>
                     </span>
                   )
                }
             </p>
             {score < 100 && (
                <div className="mt-2 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500" style={{ width: `${score}%` }}></div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const PhotoGridItem: React.FC<{ 
  index: number; 
  image: string | null; 
  isMain?: boolean;
  onRemove: () => void;
  onAdd: () => void;
  isLoading?: boolean;
}> = ({ index, image, isMain, onRemove, onAdd, isLoading }) => {
  return (
    <div 
      className={`
        relative rounded-xl overflow-hidden bg-white/40 dark:bg-white/5 border-2 
        ${isMain ? 'border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] row-span-2 col-span-2' : 'border-dashed border-pink-200 dark:border-white/10'}
        group transition-all cursor-pointer
      `}
      onClick={(e) => {
        if(!image && !isLoading) onAdd();
      }}
    >
       {isLoading ? (
         <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5">
            <Loader2 className="animate-spin text-pink-500 mb-2" size={isMain ? 32 : 20} />
            <span className="text-[10px] text-pink-500 font-bold">Uploading...</span>
         </div>
       ) : image ? (
         <div onClick={onAdd} className="w-full h-full relative">
           <img src={image} className="w-full h-full object-cover" draggable={false} alt={`Profile ${index}`} />
           
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full border border-white/20 backdrop-blur-sm flex items-center gap-1">
                 <ImageIcon size={12} /> Replace
              </span>
           </div>

           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                 <X size={14} />
              </button>
           </div>
           {isMain && (
             <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide pointer-events-none">
                Main
             </div>
           )}
           <div className="absolute bottom-1 right-1 bg-black/40 text-white/50 text-[10px] px-1.5 rounded pointer-events-none">
             {index + 1}
           </div>
         </div>
       ) : (
         <div className="w-full h-full flex flex-col items-center justify-center text-pink-300 dark:text-white/20 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-500/5 transition-all">
            <Plus size={isMain ? 32 : 24} />
            {isMain && <span className="text-xs font-bold uppercase mt-2 tracking-widest">Add Photo</span>}
         </div>
       )}
    </div>
  );
};

// --- MAIN EDIT COMPONENT ---

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onCancel }) => {
  const [activeMode, setActiveMode] = useState<'edit' | 'location' | 'preview'>('edit');
  
  // Local Form State
  const [formData, setFormData] = useState<User>({ ...user });
  const [smartPhotos, setSmartPhotos] = useState(true);
  
  // Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadingIndexes, setUploadingIndexes] = useState<number[]>([]);
  
  // AI & Validation State
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [bioTone, setBioTone] = useState('Professional');
  const [validationError, setValidationError] = useState<string | null>(null);

  // File Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [targetImageIndex, setTargetImageIndex] = useState<number | null>(null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  // Helpers
  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleSocialChange = (network: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socials: { ...prev.socials, [network]: value }
    }));
    setValidationError(null);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      if (file.size > 50 * 1024 * 1024) {
        alert("Video is too large. Please keep it under 50MB.");
        return;
      }

      setIsUploadingVideo(true);
      try {
        const path = `users/${user.id}/videos/${Date.now()}_${file.name}`;
        const url = await api.uploadFile(file, path);
        handleChange('introVideoUrl', url);
      } catch (err) {
        console.error("Video Upload Failed", err);
        alert("Failed to upload video");
      } finally {
        setIsUploadingVideo(false);
      }
    }
  };

  const triggerImageUpload = (index: number) => {
    setTargetImageIndex(index);
    imageInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && targetImageIndex !== null) {
       const file = e.target.files[0];
       const index = targetImageIndex;
       
       setUploadingIndexes(prev => [...prev, index]);
       setTargetImageIndex(null); 

       try {
           const path = `users/${user.id}/images/${Date.now()}_${file.name}`;
           const url = await api.uploadFile(file, path);
           
           if (index === 0) {
              handleChange('avatar', url);
           } else {
              const currentPortfolio = [...(formData.portfolio || [])];
              const portfolioIndex = index - 1;
              
              while(currentPortfolio.length < portfolioIndex) {
                  currentPortfolio.push(""); 
              }
              currentPortfolio[portfolioIndex] = url;
              handleChange('portfolio', currentPortfolio);
           }
       } catch (error) {
           console.error("Image Upload Failed", error);
           alert("Failed to upload image. Please try again.");
       } finally {
           setUploadingIndexes(prev => prev.filter(i => i !== index));
           if (imageInputRef.current) imageInputRef.current.value = '';
       }
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (index === 0) {
       handleChange('avatar', PLACEHOLDER_AVATAR); 
    } else {
       const currentPortfolio = (formData.portfolio || []).filter((_, i) => i !== (index - 1));
       handleChange('portfolio', currentPortfolio);
    }
  };

  const getPhotoAtIndex = (index: number) => {
    if (index === 0) return formData.avatar;
    return formData.portfolio ? formData.portfolio[index - 1] : null;
  };

  const generateAIBio = async () => {
    setIsGeneratingBio(true);
    const bio = await geminiService.generateBio(formData, bioTone);
    handleChange('bio', bio);
    setIsGeneratingBio(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const locationName = await geminiService.identifyLocation(latitude, longitude);
        if (locationName && locationName !== "Location Unavailable") {
          handleChange('location', locationName);
        } else {
          alert("Could not identify specific city/state. Please check manually.");
        }
      } catch (e) {
        console.error("Location error", e);
        alert("Location service unavailable. Please enter manually.");
      }
      setIsLocating(false);
    }, (error) => {
      console.error("Geolocation error:", error);
      let errorMsg = "Unable to retrieve location.";
      if (error.code === 1) errorMsg = "Location permission denied. Please enable in browser settings.";
      else if (error.code === 2) errorMsg = "Location unavailable.";
      else if (error.code === 3) errorMsg = "Location request timed out.";
      
      alert(errorMsg);
      setIsLocating(false);
    }, options);
  };

  const validateAndSave = () => {
    if (!formData.name?.trim()) {
       setValidationError("Display Name is required.");
       setActiveMode('edit');
       return;
    }
    onSave(formData);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0f0c29] text-gray-900 dark:text-white transition-colors duration-300">
      
      <input 
         type="file" 
         ref={imageInputRef} 
         className="hidden" 
         accept="image/*"
         onChange={handleImageFileChange}
      />

      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#0f0c29]/90 backdrop-blur-xl border-b border-pink-100 dark:border-white/5 pb-0 transition-colors duration-300">
         <div className="px-4 py-3 flex justify-between items-center">
            <button onClick={onCancel} className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-white/80 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-bold">Edit Profile</h2>
            <button 
              onClick={validateAndSave} 
              className="text-sm font-bold bg-black text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Save
            </button>
         </div>
         
         <div className="flex px-6 gap-6 mt-2 overflow-x-auto no-scrollbar">
            <button 
               onClick={() => setActiveMode('edit')}
               className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeMode === 'edit' ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-500 dark:text-white/40'}`}
            >
               Edit Info
            </button>
            <button 
               onClick={() => setActiveMode('location')}
               className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeMode === 'location' ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-500 dark:text-white/40'}`}
            >
               Location
            </button>
            <button 
               onClick={() => setActiveMode('preview')}
               className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeMode === 'preview' ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-500 dark:text-white/40'}`}
            >
               Preview Card
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative">
         <AnimatePresence mode="wait">
            
            {activeMode === 'edit' && (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8 pb-32"
              >
                 <ProfileStrength user={formData} />

                 <AnimatePresence>
                   {validationError && (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400 mb-2"
                     >
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">{validationError}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <section className="space-y-4">
                    <h3 className="text-xs font-bold text-pink-800/50 dark:text-white/50 uppercase tracking-widest">Basic Info <span className="text-red-500 font-bold ml-0.5">*</span></h3>
                    <div className="relative">
                       <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                          type="text" 
                          value={formData.name || ''} 
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Display Name"
                          className={`w-full bg-gray-50 dark:bg-white/5 border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors font-bold text-lg ${!formData.name?.trim() && validationError?.includes("Name") ? 'border-red-500' : 'border-pink-100 dark:border-white/10 focus:border-pink-500'}`}
                       />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                        <input 
                           type="text" 
                           value={formData.location || ''} 
                           onChange={(e) => handleChange('location', e.target.value)}
                           placeholder="Location (City, State)"
                           className="w-full bg-gray-50 dark:bg-white/5 border border-pink-100 dark:border-white/10 rounded-xl pl-12 pr-36 py-3 text-sm focus:outline-none transition-colors font-bold text-lg focus:border-pink-500"
                        />
                        <button 
                            onClick={handleDetectLocation}
                            disabled={isLocating}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-black dark:bg-white/10 text-white px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 z-20"
                        >
                            {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                            {isLocating ? 'Locating...' : 'Get Location'}
                        </button>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xs font-bold text-pink-800/50 dark:text-white/50 uppercase tracking-widest">Profile Photos <span className="text-red-500 font-bold ml-0.5">*</span></h3>
                       <button onClick={() => setSmartPhotos(!smartPhotos)} className="flex items-center gap-2 text-xs font-bold text-pink-500">
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${smartPhotos ? 'bg-pink-500' : 'bg-gray-400'}`}>
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${smartPhotos ? 'left-4.5' : 'left-0.5'}`} style={{ left: smartPhotos ? '18px' : '2px' }}></div>
                          </div>
                          Smart Photos
                       </button>
                    </div>
                    
                    <div className={`grid grid-cols-3 grid-rows-3 gap-3 aspect-square p-2 rounded-2xl border-2 transition-colors ${validationError?.includes("photos") ? 'border-red-500/50 bg-red-500/5' : 'border-transparent'}`}>
                       {[0, 1, 2, 3, 4, 5].map(i => (
                          <PhotoGridItem 
                             key={i} 
                             index={i} 
                             image={getPhotoAtIndex(i)} 
                             isMain={i === 0} 
                             onRemove={() => handleRemovePhoto(i)}
                             onAdd={() => triggerImageUpload(i)}
                             isLoading={uploadingIndexes.includes(i)}
                          />
                       ))}
                    </div>
                    <p className={`text-xs text-center font-bold tracking-wide ${validationError?.includes("photos") ? 'text-red-500' : 'text-gray-400 dark:text-white/30'}`}>
                       Minimum 5 photos recommended.
                    </p>
                 </section>

                 <section className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-pink-800/50 dark:text-white/50 uppercase tracking-widest flex items-center gap-2">
                         <Film size={12} /> Video Pitch
                      </h3>
                      
                      {formData.introVideoUrl ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-pink-500/30 shadow-lg group w-full">
                           <video 
                              src={formData.introVideoUrl} 
                              className="w-full h-full object-cover" 
                              controls
                              playsInline
                           />
                           
                           <button 
                              onClick={() => handleChange('introVideoUrl', undefined)}
                              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500 transition-colors backdrop-blur-md z-10"
                           >
                               <Trash2 size={16} />
                           </button>
                        </div>
                      ) : (
                        <div className={`relative border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-pink-50/50 dark:hover:bg-white/5 transition-colors group ${validationError?.includes("Video") ? 'border-red-500 bg-red-500/5' : 'border-pink-200 dark:border-white/10'}`}>
                           <input 
                             type="file" 
                             accept="video/*"
                             onChange={handleVideoUpload}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                             disabled={isUploadingVideo}
                           />
                           
                           {isUploadingVideo ? (
                              <div className="flex flex-col items-center gap-2 text-pink-500">
                                 <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                 <span className="text-[10px] font-bold">Uploading...</span>
                              </div>
                           ) : (
                              <>
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${validationError?.includes("Video") ? 'bg-red-100 text-red-500' : 'bg-pink-100 dark:bg-white/10 text-pink-500'}`}>
                                    <Video size={16} />
                                 </div>
                                 <p className="text-xs font-bold text-gray-600 dark:text-white/80">Add Video Intro</p>
                              </>
                           )}
                        </div>
                      )}
                    </div>
                 </section>

                 <section className="space-y-3">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-pink-800/50 dark:text-white/50 uppercase tracking-widest">About Me <span className="text-red-500 font-bold ml-0.5">*</span></h3>
                            <button 
                                onClick={generateAIBio}
                                disabled={isGeneratingBio}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-orange-400 px-3 py-1.5 rounded-full shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isGeneratingBio ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" /> Writing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={12} fill="currentColor" /> Generate Bio
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['Professional', 'Fun', 'Creative', 'Hype'].map(tone => (
                                <button
                                    key={tone}
                                    onClick={() => setBioTone(tone)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                        bioTone === tone 
                                        ? 'bg-pink-500 text-white border-pink-500' 
                                        : 'bg-white dark:bg-white/5 text-gray-500 dark:text-white/50 border-gray-200 dark:border-white/10 hover:border-pink-500/50'
                                    }`}
                                >
                                    {tone}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                       <textarea 
                          value={formData.bio || ''}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          maxLength={500}
                          className={`w-full h-32 bg-gray-50 dark:bg-white/5 border rounded-2xl p-4 text-sm focus:outline-none resize-none leading-relaxed transition-colors ${!formData.bio?.trim() && validationError?.includes("Bio") ? 'border-red-500' : 'border-pink-100 dark:border-white/10 focus:border-pink-500'}`}
                          placeholder="Write a catchy bio..."
                       />
                       <span className="absolute bottom-3 right-3 text-[10px] text-gray-400">
                          {(formData.bio?.length || 0)}/500
                       </span>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-xs font-bold text-pink-800/50 dark:text-white/50 uppercase tracking-widest">Social Links <span className="text-red-500 font-bold ml-0.5">*</span></h3>
                    <div className={`space-y-3 p-3 rounded-2xl border-2 transition-colors ${validationError?.includes("social") ? 'border-red-500 bg-red-500/5' : 'border-transparent'}`}>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                             <Instagram size={18} />
                          </div>
                          <input 
                             type="text" 
                             value={formData.socials?.instagram || ''} 
                             onChange={(e) => handleSocialChange('instagram', e.target.value)}
                             placeholder="Instagram Username"
                             className="flex-1 bg-gray-50 dark:bg-white/5 border border-pink-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                          />
                       </div>
                    </div>
                 </section>

              </motion.div>
            )}

            {activeMode === 'location' && (
              <motion.div 
                key="location" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="h-full flex flex-col relative"
              >
                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]"></div>
                 </div>

                 <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 space-y-8">
                     
                     <div className="relative">
                        <div className={`absolute inset-0 bg-pink-500/20 rounded-full blur-xl transition-all duration-1000 ${isLocating ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
                        <div className="relative w-28 h-28 bg-white dark:bg-white/5 border border-pink-100 dark:border-white/10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl">
                           <Navigation 
                              size={48} 
                              className={`text-pink-500 transition-all duration-1000 ${isLocating ? 'animate-bounce' : ''}`} 
                              fill={isLocating ? "currentColor" : "none"}
                           />
                        </div>
                        {isLocating && (
                           <>
                              <div className="absolute inset-0 border-2 border-pink-500/30 rounded-full animate-ping"></div>
                              <div className="absolute inset-0 border border-pink-500/20 rounded-full animate-ping animation-delay-200"></div>
                           </>
                        )}
                     </div>

                     <div className="text-center space-y-2 max-w-xs">
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                           {isLocating ? 'Finding you...' : 'Set Location'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">
                           We prioritize local matches. Connect with brands and creators in your specific city.
                        </p>
                     </div>

                     <div className="w-full max-w-xs space-y-4">
                        <div className="relative group">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                           <input 
                              type="text" 
                              value={formData.location || ''} 
                              onChange={(e) => handleChange('location', e.target.value)}
                              placeholder="City, State" 
                              className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-pink-500/20 focus:bg-white dark:focus:bg-black/40 rounded-2xl pl-12 pr-4 py-4 text-center font-bold text-lg text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 transition-all shadow-inner" 
                           />
                        </div>

                        <button 
                           onClick={handleDetectLocation}
                           disabled={isLocating}
                           className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-6"
                        >
                           {isLocating ? (
                              <>
                                 <Loader2 size={18} className="animate-spin" />
                                 <span>Detecting...</span>
                              </>
                           ) : (
                              <>
                                 <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                 <span>Use Current Location</span>
                              </>
                           )}
                        </button>
                     </div>
                 </div>
              </motion.div>
            )}

            {activeMode === 'preview' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex items-center justify-center p-6 bg-gray-100 dark:bg-black/40"
              >
                 <div className="w-full max-w-sm h-[75vh] relative rounded-3xl overflow-hidden shadow-2xl">
                    <ProfileCard 
                        user={formData} 
                        role={user.role === UserRole.BUSINESS ? UserRole.INFLUENCER : UserRole.BUSINESS} 
                        isPremium={user.isPremium} 
                    />
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};