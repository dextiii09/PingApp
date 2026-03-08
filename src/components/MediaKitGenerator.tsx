import React, { useRef, useState } from 'react';
import { User, Contract, Review } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileText, Download, Check, Loader2, Sparkles, MapPin, IndianRupee, Star, Instagram, Youtube, Twitter } from 'lucide-react';

interface MediaKitGeneratorProps {
    user: User;
    completedDealsCount: number;
    reviews: Review[];
    geminiIntroText?: string;
}

export const MediaKitGenerator: React.FC<MediaKitGeneratorProps> = ({
    user,
    completedDealsCount,
    reviews,
    geminiIntroText
}) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [success, setSuccess] = useState(false);

    const generatePDF = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        setSuccess(false);

        try {
            // 1. Temporarily display the hidden element on screen (but offscreen/z-index hidden) to render properly
            const element = printRef.current;
            element.style.display = 'block';

            // 2. Capture the element via html2canvas
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true, // Allow external images (like avatars) to load
                logging: false,
                backgroundColor: '#0f0c29', // Match our dark theme
            });

            // 3. Hide it again
            element.style.display = 'none';

            // 4. Convert to PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

            // 5. Download
            pdf.save(`${user.name.replace(/\s+/g, '_')}_MediaKit.pdf`);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Error generating Media Kit. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                    {isGenerating ? (
                        <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
                    ) : success ? (
                        <><Check size={18} /> Downloaded!</>
                    ) : (
                        <><FileText size={18} /> Export Profile PDF</>
                    )}
                </span>
            </button>

            {/* --- HIDDEN PDF TEMPLATE --- */}
            {/* This element is completely invisible to the user but is perfectly styled for the PDF export */}
            <div className="overflow-hidden h-0 w-0 opacity-0 pointer-events-none fixed top-0 left-0">
                <div
                    ref={printRef}
                    className="bg-[#0f0c29] text-white w-[1200px] min-h-[1600px] p-16 font-sans relative"
                    style={{ display: 'none' }} // Toggled on during export
                >
                    {/* Header Graphic */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pink-500/20 to-purple-500/0 rounded-bl-full pointer-events-none" />

                    <div className="flex gap-16 relative z-10">
                        {/* Left Column: Avatar & Basic Info */}
                        <div className="w-1/3 space-y-8">
                            <img
                                src={user.avatar || 'https://picsum.photos/400/400'}
                                alt={user.name}
                                className="w-full aspect-square object-cover rounded-3xl border-4 border-white/10 shadow-2xl"
                                crossOrigin="anonymous"
                            />

                            <div className="space-y-4">
                                <h1 className="text-6xl font-extrabold tracking-tight">{user.name}</h1>
                                <div className="text-2xl text-pink-400 font-bold uppercase tracking-widest flex items-center gap-3">
                                    <MapPin size={28} /> {user.location || 'Global'}
                                </div>
                                {user.tags && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {user.tags.map(tag => (
                                            <span key={tag} className="bg-white/10 px-4 py-2 rounded-lg text-lg font-bold border border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ping Platform Stats */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 mt-12 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white/50 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Ping Platform Metrics</h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl text-white/80">Total Value Driven</span>
                                        <span className="text-3xl font-bold flex items-center text-green-400">
                                            <IndianRupee size={24} /> {user.totalEarnings?.toLocaleString() || '0'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xl text-white/80">Completed Campaigns</span>
                                        <span className="text-3xl font-bold text-white">{completedDealsCount}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xl text-white/80">Ping Trust Score</span>
                                        <span className="text-3xl font-bold text-indigo-400">{user.pingScore || 75}/100</span>
                                    </div>

                                    {user.rating && (
                                        <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                            <span className="text-xl text-white/80">Average Rating</span>
                                            <div className="flex items-center gap-2">
                                                <Star size={28} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-3xl font-bold text-white">{user.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bio, Socials, Reviews */}
                        <div className="w-2/3 pl-12 border-l border-white/10 space-y-16 py-8">

                            {/* Introduction */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-pink-400 mb-4">
                                    <Sparkles size={32} />
                                    <h2 className="text-3xl font-bold uppercase tracking-widest">Creator Biography</h2>
                                </div>
                                <p className="text-2xl leading-relaxed text-white/90">
                                    {user.bio || 'No biography provided.'}
                                </p>
                                {geminiIntroText && (
                                    <div className="mt-8 p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl">
                                        <p className="text-xl italic text-indigo-200 leading-relaxed font-serif">
                                            "{geminiIntroText}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Social Channels Map */}
                            {user.socials && Object.values(user.socials).some(v => v) && (
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-bold uppercase tracking-widest text-white/50 border-b border-white/10 pb-4">Digital Footprint</h2>
                                    <div className="grid grid-cols-2 gap-8">
                                        {user.socials.instagram && (
                                            <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                                <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-4 rounded-xl text-white">
                                                    <Instagram size={32} />
                                                </div>
                                                <div className="text-2xl font-bold">{user.socials.instagram}</div>
                                            </div>
                                        )}
                                        {user.socials.youtube && (
                                            <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                                <div className="bg-red-500 p-4 rounded-xl text-white">
                                                    <Youtube size={32} />
                                                </div>
                                                <div className="text-2xl font-bold">{user.socials.youtube}</div>
                                            </div>
                                        )}
                                        {user.socials.twitter && (
                                            <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                                <div className="bg-blue-400 p-4 rounded-xl text-white">
                                                    <Twitter size={32} />
                                                </div>
                                                <div className="text-2xl font-bold">{user.socials.twitter}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Verified Brand Reviews */}
                            {reviews && reviews.length > 0 && (
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-bold uppercase tracking-widest text-white/50 border-b border-white/10 pb-4">Verified Brand Reviews</h2>
                                    <div className="space-y-6">
                                        {reviews.slice(0, 3).map((review) => (
                                            <div key={review.id} className="p-8 bg-white/5 border border-white/10 rounded-2xl relative">
                                                <div className="flex gap-2 mb-4">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={24} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"} />
                                                    ))}
                                                </div>
                                                <p className="text-2xl text-white/90 leading-relaxed font-serif italic">"{review.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Footer branding */}
                    <div className="absolute bottom-12 left-16 right-16 border-t border-white/10 pt-8 flex justify-between items-center text-white/30 text-lg uppercase tracking-widest font-bold">
                        <span>Powered by Ping Platform</span>
                        <span>Verified Creator Intel</span>
                    </div>

                </div>
            </div>
        </>
    );
};
