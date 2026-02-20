
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Explicit configuration for pingapp-ca5fb
const firebaseConfig = {
  apiKey: "AIzaSyCKVgBb0YV5GoX0w-oeNwXuWOCZ5crLgyc",
  authDomain: "pingapp-ca5fb.firebaseapp.com",
  projectId: "pingapp-ca5fb",
  storageBucket: "pingapp-ca5fb.firebasestorage.app",
  messagingSenderId: "450129567945",
  appId: "1:450129567945:web:2c12b1efaaf888b2b5ed18",
  measurementId: "G-F02GG2QXZF"
};

// Check if config is actually present
export const isConfigured = !!firebaseConfig.apiKey;

let app;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (isConfigured) {
  try {
    // Prevent double initialization
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Initialize Analytics if supported (browser environment)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics failed to initialize", e);
      }
    }
    
    console.log("Firebase initialized successfully for: pingapp-ca5fb");
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
} else {
  console.warn("Firebase is NOT configured.");
}

export { auth, db, storage, analytics };
