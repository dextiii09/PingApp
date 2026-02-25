import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace literal \n in environment variables with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            }),
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error', error);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userIds, isBroadcast, title, body, data } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and payload body are required' });
    }

    try {
        let fcmTokens: string[] = [];

        if (isBroadcast) {
            // God Mode Broadcast: Fetch all users and aggregate tokens
            const usersSnap = await admin.firestore().collection("users").get();
            usersSnap.forEach(doc => {
                const user = doc.data();
                if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
                    fcmTokens.push(...user.fcmTokens);
                }
            });
        } else if (userIds && Array.isArray(userIds)) {
            // Point-to-point Push: Fetch specifically selected users' tokens
            for (const uid of userIds) {
                const userDoc = await admin.firestore().collection("users").doc(uid).get();
                if (userDoc.exists) {
                    const user = userDoc.data();
                    if (user?.fcmTokens && Array.isArray(user.fcmTokens)) {
                        fcmTokens.push(...user.fcmTokens);
                    }
                }
            }
        }

        // Filter out empty tokens
        fcmTokens = fcmTokens.filter(t => t);

        if (fcmTokens.length === 0) {
            return res.status(200).json({ message: 'No registered FCM tokens found for target users' });
        }

        // Firebase MulticastMessage limit is 500 tokens per request
        const chunkSize = 500;
        let successCount = 0;
        let failureCount = 0;
        const failedTokens: string[] = [];

        for (let i = 0; i < fcmTokens.length; i += chunkSize) {
            const tokenChunk = fcmTokens.slice(i, i + chunkSize);
            const message: admin.messaging.MulticastMessage = {
                notification: { title, body },
                data: data || {},
                tokens: tokenChunk
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            successCount += response.successCount;
            failureCount += response.failureCount;

            // Cleanup invalid tokens processing
            if (response.failureCount > 0) {
                response.responses.forEach((result, index) => {
                    const error = result.error;
                    if (error) {
                        if (
                            error.code === "messaging/invalid-registration-token" ||
                            error.code === "messaging/registration-token-not-registered"
                        ) {
                            failedTokens.push(tokenChunk[index]);
                        }
                    }
                });
            }
        }

        // Return final delivery report payload
        return res.status(200).json({
            success: true,
            successCount,
            failureCount,
            deadTokensRemoved: failedTokens.length
        });
    } catch (error: any) {
        console.error('Error sending push notification:', error);
        return res.status(500).json({ error: error.message });
    }
}
