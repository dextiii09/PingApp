
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

  // --- AUTHENTICATION ---

  async login(role: UserRole, email?: string, password?: string): Promise<User> {
    this.checkConfig();

    // --- DEMO ACCOUNT PERMANENCE LOGIC ---
    if (email === 'hello@pixelarcade.co') {
        const id = 'test-biz-1';
        const docRef = doc(db, "users", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            this.currentUser = snap.data() as User;
        } else {
            this.currentUser = MOCK_BUSINESS_USERS[0];
            await setDoc(docRef, this.currentUser); // Persist initial state
        }
        localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
        return this.currentUser;
    }
    
    if (email === 'jamie.travels@social.com') {
        const id = 'test-inf-1';
        const docRef = doc(db, "users", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            this.currentUser = snap.data() as User;
        } else {
            this.currentUser = MOCK_INFLUENCER_USERS[0];
            await setDoc(docRef, this.currentUser); // Persist initial state
        }
        localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
        return this.currentUser;
    }
    // ---------------------------

    if (!email || !password) throw new Error("Email and password required for Firebase Auth");

    try {
      let userCredential;
      try {
        // 1. Authenticate with Firebase Auth
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        // 1b. Auto-provision Admin if not found (Bootstrap flow)
        if (role === UserRole.ADMIN && (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-login-credentials')) {
           console.log("Admin account not found in Auth. Provisioning new Admin...");
           try {
             userCredential = await createUserWithEmailAndPassword(auth, email, password);
             
             const adminUser: User = {
                id: userCredential.user.uid,
                name: 'System Admin',
                email: email,
                role: UserRole.ADMIN,
                avatar: APP_LOGO, // Use the new App Logo as Admin Avatar
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
             console.error("Failed to provision admin:", createError);
             throw authError; 
           }
        }
        throw authError;
      }

      const uid = userCredential.user.uid;

      // 2. Fetch User Profile from Firestore
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const fetchedUser = userDoc.data() as User;
        this.currentUser = fetchedUser;

        // Force Update Admin Avatar if needed
        if (role === UserRole.ADMIN && fetchedUser.avatar !== APP_LOGO) {
            console.log("Updating Admin Avatar to latest logo...");
            this.currentUser.avatar = APP_LOGO;
            // Run update in background
            updateDoc(userDocRef, { avatar: APP_LOGO }).catch(e => console.warn("Failed to update admin avatar", e));
        }

        localStorage.setItem('ping_session_user', JSON.stringify(this.currentUser));
        return this.currentUser;
      } else {
        // If Auth exists but Firestore doc is missing (e.g., deleted manually), recreate for Admin
        if (role === UserRole.ADMIN) {
             const adminUser: User = {
                id: uid,
                name: 'System Admin',
                email: email,
                role: UserRole.ADMIN,
                avatar: APP_LOGO, // Use App Logo
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
        throw new Error("User profile not found in database.");
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
        stats: role === UserRole.BUSINESS ? { budget: '$0' } : { followers: '0', engagement: '0%' },
        verified: false,
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.UNVERIFIED,
        joinedAt: Date.now(),
        reportCount: 0,
        isPremium: false,
        socials: {},
        portfolio: []
      };

      // Create document in Firestore
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
    
    // We attempt real upload for ALL users now to ensure persistence
    try {
        if (!storage) throw new Error("Storage not initialized");
        
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Storage Upload Error:", error);
        // Only fallback to temp blob if REAL upload fails (e.g. offline)
        // This effectively alerts the user that persistence failed if they refresh
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
      
      // Update local session if needed
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
    if (!this.currentUser) throw new Error("No user logged in");
    
    // For Demo Users, return the opposite Mock Data list immediately
    if (this.currentUser.id.startsWith('test-')) {
        const targetRole = userRole === UserRole.BUSINESS ? UserRole.INFLUENCER : UserRole.BUSINESS;
        const q = query(
            collection(db, "users"), 
            where("role", "==", targetRole),
            where("status", "==", UserStatus.ACTIVE)
        );
        const dbUsers = (await getDocs(q)).docs.map(d => d.data() as User);
        if (dbUsers.length < 3) {
             return userRole === UserRole.BUSINESS ? MOCK_INFLUENCER_USERS : MOCK_BUSINESS_USERS;
        }
        return dbUsers;
    }

    if (!isConfigured) return [];

    const targetRole = userRole === UserRole.BUSINESS ? UserRole.INFLUENCER : UserRole.BUSINESS;
    
    try {
      // 1. Priority Algorithm: Check for Super Likes first
      // Fetch received swipes where direction is 'up' (Super Like)
      const receivedSwipesRef = collection(db, "users", this.currentUser.id, "received_swipes");
      const superLikeQuery = query(
          receivedSwipesRef, 
          where("direction", "==", "up"),
          where("seen", "==", false)
      );
      const superLikeDocs = await getDocs(superLikeQuery);
      const superLikerIds = new Set(superLikeDocs.docs.map(d => d.data().fromUserId));

      // 2. Fetch all candidates
      const q = query(
        collection(db, "users"), 
        where("role", "==", targetRole),
        where("status", "==", UserStatus.ACTIVE)
      );
      
      const querySnapshot = await getDocs(q);
      const candidates: User[] = [];
      const priorityCandidates: User[] = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== this.currentUser?.id) {
          const userData = doc.data() as User;
          if (superLikerIds.has(userData.id)) {
              // Add a flag or badge for UI if needed, for now just prioritize
              userData.aiMatchScore = (userData.aiMatchScore || 70) + 20; // boost score
              priorityCandidates.push(userData);
          } else {
              candidates.push(userData);
          }
        }
      });

      // Return priority candidates first, then regular
      return [...priorityCandidates, ...candidates];
    } catch (error) {
      console.error("Get Candidates Error:", error);
      return [];
    }
  }

  async swipe(userId: string, candidateId: string, direction: 'left' | 'right' | 'up'): Promise<{ isMatch: boolean; match?: Match }> {
    this.checkConfig();
    
    // 1. Record the swipe
    const swipeRef = collection(db, "users", userId, "swipes");
    await addDoc(swipeRef, {
      targetId: candidateId,
      direction,
      timestamp: Date.now()
    });

    if (direction === 'left') return { isMatch: false };

    // 2. Record received swipe
    try {
        const receivedRef = collection(db, "users", candidateId, "received_swipes");
        await addDoc(receivedRef, {
            fromUserId: userId,
            direction: direction,
            timestamp: Date.now(),
            seen: false
        });
    } catch (e) {
        console.warn("Could not record received swipe", e);
    }

    // 3. Check Match
    const candidateSwipesRef = collection(db, "users", candidateId, "swipes");
    // Match if they swiped Right OR Up (Super Like)
    const q = query(
      candidateSwipesRef, 
      where("targetId", "==", userId), 
      where("direction", "in", ["right", "up"])
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const candidateDoc = await getDoc(doc(db, "users", candidateId));
      const candidateProfile = candidateDoc.data() as User;

      const newMatch: Match = {
        id: [userId, candidateId].sort().join("_"), 
        users: [userId, candidateId],
        lastActive: Date.now(),
        userProfile: candidateProfile,
        lastMessage: ''
      };

      await setDoc(doc(db, "matches", newMatch.id), newMatch);
      return { isMatch: true, match: newMatch };
    }

    return { isMatch: false };
  }

  // --- MATCHES & MESSAGING ---

  async getMatches(): Promise<Match[]> {
    if (!this.currentUser) return [];
    if (!isConfigured) return [];
    
    try {
      const q = query(
        collection(db, "matches"),
        where("users", "array-contains", this.currentUser.id)
      );
      
      const snapshot = await getDocs(q);
      const matches: Match[] = [];

      for (const d of snapshot.docs) {
        const data = d.data();
        const otherUserId = data.users.find((uid: string) => uid !== this.currentUser?.id);
        if (otherUserId) {
           const userDoc = await getDoc(doc(db, "users", otherUserId));
           if (userDoc.exists()) {
             matches.push({
               ...data,
               id: d.id,
               userProfile: userDoc.data() as User
             } as Match);
           }
        }
      }
      return matches;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getMessages(matchId: string): Promise<Message[]> {
    if (!isConfigured) return [];
    const messagesRef = collection(db, "matches", matchId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  }

  async sendMessage(matchId: string, text: string): Promise<Message> {
    if (!this.currentUser) throw new Error("Not logged in");
    this.checkConfig();

    const messageData: Partial<Message> = {
      senderId: this.currentUser.id,
      text,
      timestamp: Date.now(),
      read: false
    };

    const messagesRef = collection(db, "matches", matchId, "messages");
    const docRef = await addDoc(messagesRef, messageData);

    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, {
      lastMessage: text,
      lastActive: Date.now()
    });

    return { id: docRef.id, ...messageData } as Message;
  }

  // --- NOTIFICATIONS & LIKES ---

  async getNotifications(): Promise<Notification[]> {
    return []; 
  }

  async getNewLikesCount(): Promise<number> {
    if (!this.currentUser) return 0;
    if (!isConfigured) return 0;
    try {
        const q = query(
            collection(db, "users", this.currentUser.id, "received_swipes"),
            where("seen", "==", false)
        );
        const snap = await getDocs(q);
        return snap.size;
    } catch (e) {
        console.warn("Failed to get likes count", e);
        return 0;
    }
  }

  // --- ADMIN / UTILS ---

  async getAllUsers(): Promise<User[]> {
    if (!isConfigured) return [];
    const s = await getDocs(collection(db, "users"));
    return s.docs.map(d => d.data() as User);
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    this.checkConfig();
    await updateDoc(doc(db, "users", userId), { status });
  }

  async verifyUser(userId: string, isApproved: boolean): Promise<void> {
    this.checkConfig();
    await updateDoc(doc(db, "users", userId), {
      verificationStatus: isApproved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
      verified: isApproved
    });
  }

  async addMatch(profile: User): Promise<Match> {
    if (!this.currentUser) throw new Error("No user");
    return this.swipe(this.currentUser.id, profile.id, 'right').then(r => r.match!);
  }

  async getContract(matchId: string): Promise<Contract | null> {
    return null;
  }

  async getAdminStats(): Promise<AdminStats> {
    if (!isConfigured) return { totalUsers: 0, split: { business: 0, influencer: 0 }, revenue: 0, activeMatches: 0, pendingVerifications: 0 };
    
    const usersSnap = await getDocs(collection(db, "users"));
    const matchesSnap = await getDocs(collection(db, "matches"));
    
    let businessCount = 0;
    let influencerCount = 0;
    let pendingCount = 0;

    usersSnap.forEach(doc => {
        const u = doc.data() as User;
        if (u.role === UserRole.BUSINESS) businessCount++;
        else if (u.role === UserRole.INFLUENCER) influencerCount++;
        if (u.verificationStatus === VerificationStatus.PENDING) pendingCount++;
    });

    return { 
      totalUsers: usersSnap.size, 
      split: { business: businessCount, influencer: influencerCount }, 
      revenue: usersSnap.size * 10, 
      activeMatches: matchesSnap.size, 
      pendingVerifications: pendingCount 
    };
  }

  async upgradeToPremium(): Promise<void> {
    if (!this.currentUser) return;
    this.checkConfig();
    await updateDoc(doc(db, "users", this.currentUser.id), { isPremium: true });
    this.currentUser.isPremium = true;
  }

  // --- BACKEND SEEDING ---
  
  async seedDatabase(): Promise<void> {
    this.checkConfig();
    const batch = writeBatch(db);
    
    // Seed Business Users
    MOCK_BUSINESS_USERS.forEach(user => {
        const ref = doc(db, "users", user.id);
        batch.set(ref, user);
    });

    // Seed Influencer Users
    MOCK_INFLUENCER_USERS.forEach(user => {
        const ref = doc(db, "users", user.id);
        batch.set(ref, user);
    });

    await batch.commit();
    console.log("Database seeded successfully with Mock Data!");
  }
}

export const api = new FirebaseService();
