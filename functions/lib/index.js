"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNativePushNotification = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();
/**
 * Triggers when a new document is created in the sub-collection:
 * /users/{userId}/notifications/{notificationId}
 */
exports.sendNativePushNotification = (0, firestore_1.onDocumentCreated)("users/{userId}/notifications/{notificationId}", async (event) => {
    const snapshot = event.data;
    const userId = event.params.userId;
    if (!snapshot) {
        console.log("No notification data found.");
        return;
    }
    const notificationData = snapshot.data();
    // Fetch the target user's document to get their fcmTokens
    const userDocStr = await admin.firestore().collection("users").doc(userId).get();
    if (!userDocStr.exists) {
        console.log(`User ${userId} does not exist.`);
        return;
    }
    const userData = userDocStr.data();
    const fcmTokens = (userData === null || userData === void 0 ? void 0 : userData.fcmTokens) || [];
    if (fcmTokens.length === 0) {
        console.log(`User ${userId} has no registered FCM tokens.`);
        return;
    }
    // Prepare the FCM payload
    const message = {
        notification: {
            title: notificationData.title || "Ping App",
            body: notificationData.text || "You have a new notification!",
        },
        data: {
            type: notificationData.type || "default",
        },
        tokens: fcmTokens
    };
    try {
        // Send the native push notification via FCM
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent message to ${response.successCount} devices.`);
        // Optional: Cleanup invalid tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((result, index) => {
                const error = result.error;
                if (error) {
                    if (error.code === "messaging/invalid-registration-token" ||
                        error.code === "messaging/registration-token-not-registered") {
                        failedTokens.push(fcmTokens[index]);
                    }
                }
            });
            if (failedTokens.length > 0) {
                await admin.firestore().collection("users").doc(userId).update({
                    fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens),
                });
                console.log("Removed dead FCM tokens.");
            }
        }
    }
    catch (error) {
        console.error("Error sending push notification:", error);
    }
});
//# sourceMappingURL=index.js.map