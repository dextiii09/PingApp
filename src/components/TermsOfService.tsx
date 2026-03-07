import React from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface TermsOfServiceProps {
    onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-black text-white px-4 py-8 overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto pt-10 pb-20">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-black">Terms of Service</h1>
                </div>

                <GlassCard className="p-8 prose prose-invert max-w-none">
                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using the Ping platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our platform.
                    </p>

                    <h3>2. User Representations</h3>
                    <p>
                        By using our App via Meta Login, you represent and warrant that all registration information you submit will be true, accurate, current, and complete. You are responsible for keeping your password confidential.
                    </p>

                    <h3>3. Platform Rules</h3>
                    <p>
                        Ping is a professional matching platform connecting Brands and Creators. You agree not to use the platform for any illegal, harassing, or unauthorized purpose. Brand representations and Creator portfolios must be accurate. Misrepresentation may result in an immediate profile ban.
                    </p>

                    <h3>4. Intellectual Property</h3>
                    <p>
                        The service, its original content, features, and functionality are owned by Ping and are protected by international copyright, trademark, and intellectual property laws. Content hosted on your portfolio remains your property.
                    </p>

                    <h3>5. Third-Party Integrations</h3>
                    <p>
                        Our service utilizes features connected to Meta's Graph API. We are not responsible for the availability, accuracy, or reliability of data provided by Meta.
                    </p>

                    <p className="text-sm text-gray-500 mt-10">Effective Date: March 2026</p>
                </GlassCard>
            </div>
        </div>
    );
};
