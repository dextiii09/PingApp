import React from 'react';
import { ArrowLeft, Trash2, ShieldAlert } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface DataDeletionProps {
    onBack: () => void;
}

export const DataDeletion: React.FC<DataDeletionProps> = ({ onBack }) => {
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-black">Data Deletion Instructions</h1>
                </div>

                <GlassCard className="p-8 prose prose-invert max-w-none">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-4 mb-8">
                        <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                        <p className="m-0 text-red-200 text-sm">
                            In accordance with Meta and GDPR compliance regulations, you have the absolute right to request the complete deletion of your data from Ping's systems. This action is permanent and cannot be undone.
                        </p>
                    </div>

                    <h3>How to Delete Your Data within Ping App</h3>
                    <p>
                        If you still have access to your account, you can permanently delete your data instantly:
                    </p>
                    <ol>
                        <li>Log in to the Ping App.</li>
                        <li>Click on the <strong>Profile Tab</strong> in the bottom navigation menu.</li>
                        <li>Click the <strong>Settings (Gear) icon</strong> in the top right corner.</li>
                        <li>Scroll to the bottom of the Settings page.</li>
                        <li>Click the red <strong>"Delete Account"</strong> button.</li>
                        <li>All associated data, messages, and profile information will be purged from our active databases within 24 hours.</li>
                    </ol>

                    <h3>How to Delete Your Data via Email</h3>
                    <p>
                        If you have uninstalled the app or cannot log in, you can manually submit a deletion request to our compliance team.
                    </p>
                    <p>
                        Send an email to <strong>prakashsuraj0610@gmail.com</strong> with the subject line <strong>"Data Deletion Request"</strong>. Please include the email address associated with your Ping / Facebook account so we can locate your profile and manually scrub it from our systems.
                    </p>

                    <h3>What Gets Deleted?</h3>
                    <p>
                        When a deletion request is completed, we will erase:
                    </p>
                    <ul>
                        <li>Your public profile (name, stats, bio, tags, portfolio)</li>
                        <li>Your authentication data (identity linkages)</li>
                        <li>Your match history and swipe decisions</li>
                        <li>All private messages sent within the platform</li>
                    </ul>
                </GlassCard>
            </div>
        </div>
    );
};
