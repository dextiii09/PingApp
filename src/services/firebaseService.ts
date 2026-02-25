
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  query, where, addDoc, onSnapshot, orderBy, limit, writeBatch, arrayUnion
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  RecaptchaVerifier, // Keep RecaptchaVerifier for web fallback if needed, but not used in new sendOTP
  signInWithPhoneNumber, // Keep signInWithPhoneNumber for web fallback if needed, but not used in new sendOTP
  ConfirmationResult // Keep ConfirmationResult for web fallback if needed, but not used in new verifyOTP
} from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { auth, db, storage, isConfigured } from "./firebaseConfig";
import { User, UserRole, Match, Message, AdminStats, UserStatus, VerificationStatus, Contract, Notification } from '../types';
import { MOCK_BUSINESS_USERS, MOCK_INFLUENCER_USERS, PLACEHOLDER_AVATAR, APP_LOGO } from '../constants';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

class FirebaseService {
  private currentUser: User | null = null;

  // --- HELPER ---
  private checkConfig() {
    if (!isConfigured || !auth || !db) {
      throw new Error("Firebase is not configured. Please check your environment variables.");
    }
  }

  // Sync state from local storage on app reload
  syncSession(user: User | null) {
    if (user && user.id) {
      this.currentUser = user;
    } else {
      this.currentUser = null;
    }
  }

  // --- AUTHENTICATION ---

  async login(role: UserRole, email?: string, password?: string): Promise<User> {
    this.checkConfig();

    if (!email || !password) throw new Error("Email and password required for Firebase Auth");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, "users", uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const fetchedUser = userDoc.data() as User;
          this.currentUser = fetchedUser;
          if (role === UserRole.ADMIN && fetchedUser.avatar !== APP_LOGO) {
            this.currentUser.avatar = APP_LOGO;
            updateDoc(userDocRef, { avatar: APP_LOGO }).catch(e => console.warn("Failed to update admin avatar", e));
          }
          localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
          return this.currentUser;
        } else {
          // User authenticated but no profile doc exists yet
          if (role === UserRole.ADMIN) {
            const adminUser: User = {
              id: uid,
              name: 'System Admin',
              email: email,
              role: UserRole.ADMIN,
              avatar: APP_LOGO,
              tags: ['Admin'],
              status: UserStatus.ACTIVE,
              verificationStatus: VerificationStatus.VERIFIED,
              joinedAt: Date.now(),
              reportCount: 0,
              isPremium: true
            };
            await setDoc(doc(db, "users", uid), adminUser);
            this.currentUser = adminUser;
            return adminUser;
          }

          // Recover Demo Users if Auth exists but Doc missing
          if (email === 'hello@pixelarcade.co') {
            const demoUser = { ...MOCK_BUSINESS_USERS[0], id: uid };
            await setDoc(doc(db, "users", uid), demoUser);
            this.currentUser = demoUser;
            return demoUser;
          }
          if (email === 'jamie.travels@social.com') {
            const demoUser = { ...MOCK_INFLUENCER_USERS[0], id: uid };
            await setDoc(doc(db, "users", uid), demoUser);
            this.currentUser = demoUser;
            return demoUser;
          }

          throw new Error("User profile not found in database.");
        }
      } catch (firestoreError: any) {
        console.error("Firestore Error during login:", firestoreError);
        if (firestoreError.code === 'permission-denied') {
          throw new Error("Permission denied. Please check your Firestore Security Rules.");
        }
        throw firestoreError;
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  async signup(email: string, password: string, role: UserRole, name: string): Promise<User> {
    this.checkConfig();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const newUser: User = {
        id: uid,
        name,
        email,
        role,
        avatar: PLACEHOLDER_AVATAR,
        bio: '',
        location: '',
        tags: [],
        stats: role === UserRole.BUSINESS ? { budget: '₹0' } : { followers: '0', engagement: '0%' },
        verified: false,
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.UNVERIFIED,
        joinedAt: Date.now(),
        reportCount: 0,
        isPremium: false,
        socials: {},
        portfolio: []
      };

      await setDoc(doc(db, "users", uid), newUser);
      this.currentUser = newUser;
      localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
      return newUser;
    } catch (error: any) {
      console.error("Signup Error:", error);
      throw error;
    }
  }

  // --- PHONE OTP AUTHENTICATION --- //

  async sendOTP(phoneNumber: string, appVerifierContainerId: string = 'recaptcha-container'): Promise<{ verificationId?: string, confirmationResult?: ConfirmationResult }> {
    this.checkConfig();
    try {
      if (Capacitor.isNativePlatform()) {
        // Native Android/iOS bypassing Web reCAPTCHA entirely
        const result = (await FirebaseAuthentication.signInWithPhoneNumber({
          phoneNumber,
        })) as any;
        if (!result.verificationId) throw new Error("Native verifier did not return an ID");
        return { verificationId: result.verificationId };
      } else {
        // Standard Web Browser Fallback
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, appVerifierContainerId, {
            'size': 'invisible'
          });
        }
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        return { confirmationResult };
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (!Capacitor.isNativePlatform() && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
      throw error;
    }
  }

  async verifyOTP(payload: { verificationId?: string, confirmationResult?: ConfirmationResult }, smsCode: string, role?: UserRole, name?: string): Promise<User> {
    this.checkConfig();
    try {
      let uid = "";
      let authEmail = "";

      if (Capacitor.isNativePlatform() && payload.verificationId) {
        // 1. Build a credential from the Native SDK's verification parameters
        const { PhoneAuthProvider, signInWithCredential } = await import('firebase/auth');
        const credential = PhoneAuthProvider.credential(payload.verificationId, smsCode);

        // 2. Transmute the native credential into a JS Web Session
        const userCredential = await signInWithCredential(auth, credential);
        uid = userCredential.user.uid;
        authEmail = userCredential.user.phoneNumber || '';
      } else if (!Capacitor.isNativePlatform() && payload.confirmationResult) {
        // Standard Web Verification
        const result = await payload.confirmationResult.confirm(smsCode);
        uid = result.user.uid;
        authEmail = result.user.phoneNumber || '';
      } else {
        throw new Error("Invalid OTP Verification Payload provided for the current platform.");
      }

      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Returning user login
        this.currentUser = userDoc.data() as User;
      } else {
        // First-time signup via OTP
        if (!role || !name) throw new Error("Role and Name are required for new account creation.");
        const newUser: User = {
          id: uid,
          name,
          email: `${authEmail.replace('+', '')}@pingapp.phone`, // Fallback email
          role,
          avatar: PLACEHOLDER_AVATAR,
          bio: '',
          location: '',
          tags: [],
          stats: role === UserRole.BUSINESS ? { budget: '₹0' } : { followers: '0', engagement: '0%' },
          verified: false,
          status: UserStatus.ACTIVE,
          verificationStatus: VerificationStatus.UNVERIFIED,
          joinedAt: Date.now(),
          reportCount: 0,
          isPremium: false,
          socials: {},
          portfolio: []
        };
        await setDoc(userDocRef, newUser);
        this.currentUser = newUser;
      }

      localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
      return this.currentUser;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (isConfigured && auth) {
      await signOut(auth);
    }
    this.currentUser = null;
    localStorage.removeItem('ping_session_user');
  }

  // --- STORAGE ---

  async uploadFile(file: File, path: string): Promise<string> {
    this.checkConfig();
    try {
      if (!storage) throw new Error("Storage not initialized");
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Storage Upload Error:", error);
      alert("Upload failed: Check network/config. Using temporary preview.");
      return URL.createObjectURL(file);
    }
  }

  // --- USER MANAGEMENT ---

  async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    this.checkConfig();
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, data);
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...data };
        localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      throw error;
    }
  }

  // --- DISCOVERY ---

  async getCandidates(userRole: UserRole): Promise<User[]> {
    if (!this.currentUser) return [];

    if (this.currentUser.id && this.currentUser.id.startsWith('test-')) {
      try {
        if (!isConfigured || !db) return [];
        const targetRole = userRole === UserRole.BUSINESS ? UserRole.INFLUENCER : UserRole.BUSINESS;
        const q = query(
          collection(db, "users"),
          where("role", "==", targetRole),
          where("status", "==", UserStatus.ACTIVE)
        );
        const dbUsers = (await getDocs(q)).docs.map(d => d.data() as User);
        return dbUsers;
      } catch (e) {
        return [];
      }
    }

    if (!isConfigured || !db) return [];
    const targetRole = userRole === UserRole.BUSINESS ? UserRole.INFLUENCER : UserRole.BUSINESS;

    try {
      const receivedSwipesRef = collection(db, "users", this.currentUser.id, "received_swipes");
      const superLikeQuery = query(receivedSwipesRef, where("direction", "==", "up"), where("seen", "==", false));
      const superLikeDocs = await getDocs(superLikeQuery).catch(() => ({ docs: [] }));
      const superLikerIds = new Set(superLikeDocs.docs.map((d: any) => d.data().fromUserId));

      const q = query(collection(db, "users"), where("role", "==", targetRole), where("status", "==", UserStatus.ACTIVE));
      const querySnapshot = await getDocs(q);
      const candidates: User[] = [];
      const priorityCandidates: User[] = [];

      querySnapshot.forEach((doc) => {
        if (doc.id !== this.currentUser?.id) {
          const userData = doc.data() as User;
          if (superLikerIds.has(userData.id)) {
            userData.aiMatchScore = (userData.aiMatchScore || 70) + 20;
            priorityCandidates.push(userData);
          } else candidates.push(userData);
        }
      });

      return [...priorityCandidates, ...candidates];
    } catch (error) {
      return [];
    }
  }

  async getDailySwipeCount(userId: string): Promise<number> {
    if (!isConfigured || !db || userId.startsWith('test-')) return 0;
    try {
      // Get start of today (midnight)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const swipesRef = collection(db, "users", userId, "swipes");
      // Right and Up swipes count towards the limit
      const q = query(swipesRef,
        where("timestamp", ">=", startOfToday.getTime()),
        where("direction", "in", ["right", "up"])
      );
      const snap = await getDocs(q);
      return snap.size;
    } catch (e) {
      console.error("Failed to fetch daily swipe count", e);
      return 0;
    }
  }

  async swipe(userId: string, candidateId: string, direction: 'left' | 'right' | 'up'): Promise<{ isMatch: boolean; match?: Match }> {
    this.checkConfig();
    const swipeRef = collection(db, "users", userId, "swipes");
    await addDoc(swipeRef, { targetId: candidateId, direction, timestamp: Date.now() });

    if (direction === 'left') return { isMatch: false };

    try {
      const receivedRef = collection(db, "users", candidateId, "received_swipes");
      await addDoc(receivedRef, { fromUserId: userId, direction: direction, timestamp: Date.now(), seen: false });
    } catch (e) { }

    const candidateSwipesRef = collection(db, "users", candidateId, "swipes");
    const q = query(candidateSwipesRef, where("targetId", "==", userId), where("direction", "in", ["right", "up"]));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const candidateDoc = await getDoc(doc(db, "users", candidateId));
      const candidateProfile = candidateDoc.data() as User;
      const matchId = [userId, candidateId].sort().join("_");

      const newMatch: Match = {
        id: matchId,
        users: [userId, candidateId],
        lastActive: Date.now(),
        userProfile: candidateProfile,
        lastMessage: '',
        lastSenderId: ''
      };
      await setDoc(doc(db, "matches", matchId), newMatch);

      // Real-time Push Notifications for Match
      await this.createNotification(userId, 'match', "New Match!", `You matched with ${candidateProfile.name}.`);
      await this.createNotification(candidateId, 'match', "New Match!", `You matched with ${this.currentUser?.name || "Someone"}.`);

      return { isMatch: true, match: newMatch };
    }
    return { isMatch: false };
  }

  // --- MATCHES & MESSAGING ---

  subscribeToMatches(userId: string, callback: (matches: Match[]) => void) {
    if (!isConfigured || !db) return () => { };
    const q = query(collection(db, "matches"), where("users", "array-contains", userId));
    return onSnapshot(q, (snapshot) => {
      const matches: Match[] = snapshot.docs.map((d) => {
        const data = d.data();
        const otherUserId = data.users.find((uid: string) => uid !== userId);
        // In onSnapshot, we rely on the document's own 'userProfile' field for speed
        // Regular getMatches can do fresh fetches if needed
        return { ...data, id: d.id } as Match;
      });
      callback(matches.sort((a, b) => b.lastActive - a.lastActive));
    });
  }

  async getMatches(): Promise<Match[]> {
    if (!this.currentUser || !isConfigured || !db) return [];
    try {
      const q = query(collection(db, "matches"), where("users", "array-contains", this.currentUser.id));
      const snapshot = await getDocs(q);
      const matches: Match[] = [];

      for (const d of snapshot.docs) {
        const data = d.data();
        const otherUserId = data.users.find((uid: string) => uid !== this.currentUser?.id);
        if (otherUserId) {
          let profile = data.userProfile;
          try {
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) profile = userDoc.data() as User;
          } catch (e) { }

          if (profile) {
            matches.push({ ...data, id: d.id, userProfile: profile } as Match);
          }
        }
      }
      return matches.sort((a, b) => b.lastActive - a.lastActive);
    } catch (e) {
      return [];
    }
  }

  subscribeToMessages(matchId: string, callback: (messages: Message[]) => void) {
    if (!isConfigured || !db) return () => { };
    const messagesRef = collection(db, "matches", matchId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(messages);
    });
  }

  async getMessages(matchId: string): Promise<Message[]> {
    if (!isConfigured || !db) return [];
    try {
      const messagesRef = collection(db, "matches", matchId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (e) {
      return [];
    }
  }

  async sendMessage(matchId: string, text: string, extraData?: Partial<Message>): Promise<Message> {
    if (!this.currentUser) throw new Error("Not logged in");
    this.checkConfig();

    const messageData: Partial<Message> = {
      senderId: this.currentUser.id,
      text,
      timestamp: Date.now(),
      read: false,
      ...extraData
    };

    const messagesRef = collection(db, "matches", matchId, "messages");
    const docRef = await addDoc(messagesRef, messageData);

    const matchRef = doc(db, "matches", matchId);
    await setDoc(matchRef, {
      lastMessage: text,
      lastSenderId: this.currentUser.id,
      lastActive: Date.now()
    }, { merge: true });

    return { id: docRef.id, ...messageData } as Message;
  }

  // --- NOTIFICATIONS & LIKES ---

  async createNotification(userId: string, type: 'match' | 'message' | 'system' | 'tip', title: string, text: string) {
    if (!isConfigured || !db) return;
    try {
      const ref = collection(db, "users", userId, "notifications");
      await addDoc(ref, {
        type,
        title,
        text,
        timestamp: Date.now(),
        read: false
      });
    } catch (e) { console.error("Notification creation failed", e); }
  }

  async getNotifications(): Promise<Notification[]> {
    if (!this.currentUser || !isConfigured || !db) return [];
    try {
      const q = query(
        collection(db, "users", this.currentUser.id, "notifications"),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Notification));
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
      return [];
    }
  }

  async markNotificationsAsRead(): Promise<void> {
    if (!this.currentUser || !isConfigured || !db) return;
    try {
      const q = query(collection(db, "users", this.currentUser.id, "notifications"), where("read", "==", false));
      const snap = await getDocs(q);
      if (snap.empty) return;

      const batch = writeBatch(db);
      snap.forEach(d => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
    } catch (e) { console.error(e); }
  }

  async getNewLikesCount(): Promise<number> {
    if (!this.currentUser || !isConfigured || !db) return 0;
    try {
      const q = query(collection(db, "users", this.currentUser.id, "received_swipes"), where("seen", "==", false));
      const snap = await getDocs(q);
      return snap.size;
    } catch (e) {
      return 0;
    }
  }

  async getPendingLikes(): Promise<{ profile: User, timestamp: number }[]> {
    if (!this.currentUser || !isConfigured || !db) return [];
    try {
      // In a real app, you might want to show BOTH seen and unseen likes in the view, 
      // but only ping the counter for unseen. Since this is an MVP, let's just fetch all the likes they got.
      const q = query(collection(db, "users", this.currentUser.id, "received_swipes"));
      const snap = await getDocs(q);

      const likes: { profile: User, timestamp: number }[] = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.matched) continue; // Don't show already matched people here

        const profileSnap = await getDoc(doc(db, "users", docSnap.id));
        if (profileSnap.exists()) {
          likes.push({ profile: profileSnap.data() as User, timestamp: data.timestamp || 0 });
        }
      }
      return likes.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async markLikesAsSeen(): Promise<void> {
    if (!this.currentUser || !isConfigured || !db) return;
    try {
      const q = query(collection(db, "users", this.currentUser.id, "received_swipes"), where("seen", "==", false));
      const snap = await getDocs(q);
      if (snap.empty) return;

      const batch = writeBatch(db);
      snap.forEach(docSnap => {
        batch.update(docSnap.ref, { seen: true });
      });
      await batch.commit();
    } catch (e) {
      console.error("Error marking likes as seen:", e);
    }
  }

  async getAnalyticsStats(userId: string): Promise<{ profileViews: number; matchRate: number; chartData: { day: string, value: number }[]; recentActivity: any[] }> {
    const fallback = { profileViews: 0, matchRate: 0, chartData: [], recentActivity: [] };
    if (!isConfigured || !db) return fallback;

    try {
      // 1. Profile Views (Total received swipes)
      const receivedRef = collection(db, "users", userId, "received_swipes");
      const receivedSnap = await getDocs(receivedRef);
      const profileViews = receivedSnap.size;

      // 2. Match Rate = (Matches / Total Swipes Performed) * 100
      const swipesRef = collection(db, "users", userId, "swipes");
      const totalSwipesPerformed = (await getDocs(swipesRef)).size;

      const matchesQuery = query(collection(db, "matches"), where("users", "array-contains", userId));
      const totalMatches = (await getDocs(matchesQuery)).size;

      const matchRate = totalSwipesPerformed > 0 ? Math.round((totalMatches / totalSwipesPerformed) * 100) : 0;

      // 3. Activity Chart (Group last 7 days of received swipes)
      const now = Date.now();
      const msPerDay = 86400000;
      const chartMap = new Map<string, number>();

      // Initialize past 7 days with 0 (ordered oldest to newest for the chart)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * msPerDay);
        chartMap.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
      }

      const recentActivity: any[] = [];
      receivedSnap.forEach(doc => {
        const data = doc.data();
        if (data.timestamp) {
          const timeDiff = now - data.timestamp;
          if (timeDiff < 7 * msPerDay) {
            const dayStr = new Date(data.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
            if (chartMap.has(dayStr)) {
              chartMap.set(dayStr, (chartMap.get(dayStr) || 0) + 1);
            }
          }
          recentActivity.push(data);
        }
      });

      recentActivity.sort((a, b) => b.timestamp - a.timestamp);
      const latestTwo = recentActivity.slice(0, 2);

      const chartData = Array.from(chartMap.entries()).map(([day, value]) => ({ day, value }));

      return { profileViews, matchRate, chartData, recentActivity: latestTwo };
    } catch (e) {
      console.error("Failed to query analytics", e);
      return fallback;
    }
  }

  // --- ADMIN / UTILS ---

  async getAllUsers(): Promise<User[]> {
    if (!isConfigured || !db) return [];
    try {
      const s = await getDocs(collection(db, "users"));
      return s.docs.map(d => d.data() as User);
    } catch (e) {
      return [];
    }
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    this.checkConfig();
    await updateDoc(doc(db, "users", userId), { status });
  }

  async verifyUser(userId: string, isApproved: boolean): Promise<void> {
    this.checkConfig();
    await updateDoc(doc(db, "users", userId), { verificationStatus: isApproved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED, verified: isApproved });
  }

  async addMatch(profile: User): Promise<Match> {
    if (!this.currentUser) throw new Error("No user");

    const matchId = [this.currentUser.id, profile.id].sort().join("_");
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    if (matchSnap.exists()) {
      return { ...matchSnap.data(), id: matchId, userProfile: profile } as Match;
    }

    return this.swipe(this.currentUser.id, profile.id, 'right').then(r => {
      if (!r.match) throw new Error("Failed to create match");
      return r.match;
    });
  }

  async getContract(matchId: string): Promise<Contract | null> { return null; }

  async getAdminStats(): Promise<AdminStats> {
    const fallback = { totalUsers: 0, split: { business: 0, influencer: 0 }, revenue: 0, activeMatches: 0, pendingVerifications: 0 };
    if (!isConfigured || !db) return fallback;

    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const matchesSnap = await getDocs(collection(db, "matches"));
      let businessCount = 0, influencerCount = 0, pendingCount = 0;

      usersSnap.forEach(doc => {
        const u = doc.data() as User;
        if (u.role === UserRole.BUSINESS) businessCount++;
        else if (u.role === UserRole.INFLUENCER) influencerCount++;
        if (u.verificationStatus === VerificationStatus.PENDING) pendingCount++;
      });

      return { totalUsers: usersSnap.size, split: { business: businessCount, influencer: influencerCount }, revenue: usersSnap.size * 10, activeMatches: matchesSnap.size, pendingVerifications: pendingCount };
    } catch (e) {
      return fallback;
    }
  }

  async upgradeToPremium(): Promise<void> {
    if (!this.currentUser) return;
    this.checkConfig();
    await updateDoc(doc(db, "users", this.currentUser.id), { isPremium: true });
    this.currentUser.isPremium = true;
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    this.checkConfig();
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token)
      });
    } catch (e) {
      console.warn("Could not save FCM token:", e);
    }
  }

  async adminBroadcastNotification(title: string, text: string): Promise<void> {
    this.checkConfig();
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      // Firestore batches have a 500 operation limit. We chunk them if needed.
      const chunks = [];
      let currentBatch = writeBatch(db);
      let opCount = 0;

      usersSnap.docs.forEach((userDoc) => {
        if (opCount >= 490) {
          chunks.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          opCount = 0;
        }
        const notifRef = doc(collection(db, "users", userDoc.id, "notifications"));
        currentBatch.set(notifRef, {
          type: 'system',
          title,
          text,
          timestamp: Date.now(),
          read: false
        });
        opCount++;
      });

      if (opCount > 0) {
        chunks.push(currentBatch.commit());
      }
      await Promise.all(chunks);
    } catch (e) {
      console.error("Broadcast failed:", e);
      throw e;
    }
  }

  async seedDatabase(): Promise<void> {
    this.checkConfig();
    const batch = writeBatch(db);
    MOCK_BUSINESS_USERS.forEach(user => batch.set(doc(db, "users", user.id), user));
    MOCK_INFLUENCER_USERS.forEach(user => batch.set(doc(db, "users", user.id), user));
    await batch.commit();
  }
}

export const api = new FirebaseService();