import React, { useRef, useEffect, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { User } from '../types';
import { motion } from 'framer-motion';
import { PhoneOff, Loader2 } from 'lucide-react';

interface VideoCallRoomProps {
    roomId: string;
    currentUser: User;
    onLeaveRoom: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ roomId, currentUser, onLeaveRoom }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        let zp: any;

        const initZego = async () => {
            if (!containerRef.current) return;

            try {
                // App ID and Server Secret for ZegoCloud (Free Tier)
                const appID = 2085771569; // Example App ID. Requires real App ID in production.
                const serverSecret = "6baecd2e0c7f078ae434316a5d48af3a"; // Example Server Secret

                // Generate Token
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID,
                    serverSecret,
                    roomId,
                    currentUser.id,
                    currentUser.name || "User"
                );

                // Create instance object from token
                zp = ZegoUIKitPrebuilt.create(kitToken);

                // Start the call in the container
                zp.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall, // Ideal for 1-1 influencer/brand meetings
                    },
                    showPreJoinView: false,
                    turnOnCameraWhenJoining: true,
                    turnOnMicrophoneWhenJoining: true,
                    showLeaveRoomConfirmDialog: false,
                    onLeaveRoom: () => {
                        if (onLeaveRoom) onLeaveRoom();
                    },
                    theme: "dark"
                });
            } catch (err) {
                console.error("ZegoCloud Initialization failed", err);
            } finally {
                setIsInitializing(false);
            }
        };

        initZego();

        // Cleanup when component unmounts
        return () => {
            if (zp && zp.destroy) {
                zp.destroy();
            }
        };
    }, [roomId, currentUser.id, currentUser.name, onLeaveRoom]);

    return (
        <motion.div
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center safe-top safe-bottom"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
            {/* Container where ZegoCloud renders the WebRTC UI */}
            <div
                ref={containerRef}
                className="w-full h-full relative"
            />

            {/* Loading Overlay */}
            {isInitializing && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white space-y-4">
                    <Loader2 size={48} className="animate-spin text-pink-500" />
                    <p className="font-bold tracking-widest uppercase">Connecting to Call Room...</p>
                </div>
            )}

            {/* Fallback Manual Exit Button in top right */}
            <button
                onClick={onLeaveRoom}
                className="absolute top-safe mt-6 right-6 z-50 bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white p-3 rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.5)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            >
                <PhoneOff size={24} />
            </button>

        </motion.div>
    );
};
