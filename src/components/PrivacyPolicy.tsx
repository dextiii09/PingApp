import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-black">Privacy Policy</h1>
                </div>

                <GlassCard className="p-8 prose prose-invert max-w-none">
                    <h3>1. Information We Collect</h3>
                    <p>
                        When you use Ping (the "App"), particularly when you choose to "Continue with Meta," we collect necessary profile information provided by the Meta Graph API. This includes, but is not limited to, your Facebook Name, Profile Avatar URL, and associated Email Address. This information is strictly used to create and verify your Ping profile.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        The data collected via Meta Authentication is used solely for the purpose of identifying you on the Ping platform, verifying you as a real creator or brand, and pulling accurate display information for your public profile card within the app.
                    </p>

                    <h3>3. Data Sharing</h3>
                    <p>
                        Ping does not sell, trade, or rent your personal identification information to others.
                    </p>

                    <h3>4. Security</h3>
                    <p>
                        We adopt appropriate data collection, storage and processing practices and security measures to protect against unauthorized access, alteration, disclosure or destruction of your personal information, username, password, transaction information and data stored on our Site. We utilize Firebase Authentication for secure token management.
                    </p>

                    <h3>5. Contacting Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at: prakashsuraj0610@gmail.com.
                    </p>

                    <p className="text-sm text-gray-500 mt-10">Last updated: March 2026</p>
                </GlassCard>
            </div>
        </div>
    );
};
