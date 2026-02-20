import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, addDoc, onSnapshot, orderBy, limit, writeBatch 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { auth, db, storage, isConfigured } from "./firebaseConfig";
import { User, UserRole, Match, Message, AdminStats, UserStatus, VerificationStatus, Contract, Notification } from '../types';
import { MOCK_BUSINESS_USERS, MOCK_INFLUENCER_USERS, PLACEHOLDER_AVATAR, APP_LOGO } from '../constants';

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
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        // Handle Admin Creation
        if (role === UserRole.ADMIN && (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-login-credentials')) {
           try {
             userCredential = await createUserWithEmailAndPassword(auth, email, password);
             const adminUser: User = {
                id: userCredential.user.uid,
                name: 'System Admin',
                email: email,
                role: UserRole.ADMIN,
                avatar: APP_LOGO, 
                tags: ['Admin', 'Superuser'],
                status: UserStatus.ACTIVE,
                verificationStatus: VerificationStatus.VERIFIED,
                joinedAt: Date.now(),
                reportCount: 0,
                isPremium: true
             };
             await setDoc(doc(db, "users", userCredential.user.uid), adminUser);
             this.currentUser = adminUser;
             return adminUser;
           } catch (createError) {
             throw authError; 
           }
        }

        // Handle Demo User Creation (Auto-create if missing in new Firebase project)
        if ((authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-login-credentials')) {
            if (email === 'hello@pixelarcade.co') {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const demoUser = { ...MOCK_BUSINESS_USERS[0], id: userCredential.user.uid };
                await setDoc(doc(db, "users", userCredential.user.uid), demoUser);
                this.currentUser = demoUser;
                localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
                return demoUser;
            }
            if (email === 'jamie.travels@social.com') {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const demoUser = { ...MOCK_INFLUENCER_USERS[0], id: userCredential.user.uid };
                await setDoc(doc(db, "users", userCredential.user.uid), demoUser);
                this.currentUser = demoUser;
                localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
                return demoUser;
            }
        }

        throw authError;
      }

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
    const fallback = userRole === UserRole.BUSINESS ? MOCK_INFLUENCER_USERS : MOCK_BUSINESS_USERS;
    if (!this.currentUser) return fallback;
    
    if (this.currentUser.id && this.currentUser.id.startsWith('test-')) {
        try {
            if (!isConfigured || !db) return fallback;
            const targetRole = userRole === UserRole.BUSINESS ? UserRole.INFLUENCER : UserRole.BUSINESS;
            const q = query(
                collection(db, "users"), 
                where("role", "==", targetRole),
                where("status", "==", UserStatus.ACTIVE)
            );
            const dbUsers = (await getDocs(q)).docs.map(d => d.data() as User);
            if (dbUsers.length < 3) return fallback;
            return dbUsers;
        } catch (e) {
            return fallback;
        }
    }

    if (!isConfigured || !db) return fallback;
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

      const results = [...priorityCandidates, ...candidates];
      return results.length > 0 ? results : fallback;
    } catch (error) {
      return fallback;
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
    } catch (e) {}

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
      return { isMatch: true, match: newMatch };
    }
    return { isMatch: false };
  }

  // --- MATCHES & MESSAGING ---

  subscribeToMatches(userId: string, callback: (matches: Match[]) => void) {
    if (!isConfigured || !db) return () => {};
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
           } catch (e) {}
           
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
    if (!isConfigured || !db) return () => {};
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

  async getNotifications(): Promise<Notification[]> { return []; }

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

  async seedDatabase(): Promise<void> {
    this.checkConfig();
    const batch = writeBatch(db);
    MOCK_BUSINESS_USERS.forEach(user => batch.set(doc(db, "users", user.id), user));
    MOCK_INFLUENCER_USERS.forEach(user => batch.set(doc(db, "users", user.id), user));
    await batch.commit();
  }
}

export const api = new FirebaseService();