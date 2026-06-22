import { create } from 'zustand';
import type { Token, Hospital, User } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';

interface QueueState {
  tokens: Token[];
  hospital: Hospital | null;
  activeHospitalId: string | null;
  currentUser: User | null;
  
  // Actions
  setHospitalId: (hospitalId: string) => void;
  setCurrentUser: (user: User | null) => void;
  initListeners: (hospitalId: string) => void;
  generateToken: (hospitalId: string, patientInfo: Partial<Token>) => Promise<Token>;
  updateStatus: (tokenId: string, status: Token['status'], servedBy?: string) => Promise<void>;
  updatePriority: (tokenId: string, priority: Token['priority']) => Promise<void>;
  callNext: (counterName: string, department?: string) => Promise<Token | null>;
  updateHospital: (hospitalId: string, updates: Partial<Hospital>) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const MOCK_HOSPITAL: Hospital = {
  id: 'H001',
  hospitalName: 'Apollo Hospital (Preview)',
  prefix: 'APO',
  subscriptionPlan: 'enterprise',
  status: 'active',
  createdAt: Date.now(),
  resetTime: '00:00',
  counters: ['Counter 1', 'Counter 2', 'Counter 3'],
  departments: ['General OPD', 'Pediatrics', 'Orthopedics'],
  floors: ['Ground Floor']
};

export const useQueueStore = create<QueueState>((set, get) => ({
  tokens: [],
  hospital: isFirebaseConfigured ? null : MOCK_HOSPITAL,
  activeHospitalId: isFirebaseConfigured ? null : 'H001',
  currentUser: isFirebaseConfigured ? null : {
    uid: 'mock-uid',
    name: 'Preview User',
    email: 'preview@example.com',
    role: 'super_admin',
    hospitalId: 'H001'
  },

  setHospitalId: (hospitalId) => set({ activeHospitalId: hospitalId }),
  setCurrentUser: (user) => set({ currentUser: user }),

  initListeners: (hospitalId) => {
    if (!isFirebaseConfigured || !db || !hospitalId) return;

    set({ activeHospitalId: hospitalId });

    // Listen to tokens
    // We remove the complex query (timestamp) to prevent Firestore "Missing Index" errors.
    // Instead, we fetch all tokens for the hospital and filter/sort them on the client side.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'tokens'), 
      where('hospitalId', '==', hospitalId)
    );
    
    onSnapshot(q, (snapshot) => {
      const liveTokens: Token[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Token;
        // Client-side filter for today's tokens to avoid composite index requirement
        if (data.timestamp >= startOfDay.getTime()) {
          liveTokens.push({ id: doc.id, ...data });
        }
      });
      
      // Client-side sort by timestamp ascending
      liveTokens.sort((a, b) => a.timestamp - b.timestamp);
      
      set({ tokens: liveTokens });
    }, (error) => {
      console.error("Error fetching tokens:", error);
    });

    // Listen to hospital profile
    onSnapshot(doc(db, 'hospitals', hospitalId), (docSnap) => {
      if (docSnap.exists()) {
        set({ hospital: { id: docSnap.id, ...docSnap.data() } as Hospital });
      } else {
        // Fallback for new unconfigured hospital / legacy migration
        set({ hospital: { ...MOCK_HOSPITAL, id: hospitalId } });
      }
    }, (error) => {
      console.error("Error fetching hospital (Check Firestore Rules!):", error);
      // Fallback to mock so the UI doesn't hang if rules block read
      set({ hospital: { ...MOCK_HOSPITAL, id: hospitalId } });
    });
  },

  generateToken: async (hospitalId, patientInfo) => {
    const { tokens, hospital } = get();
    const today = new Date().toDateString();
    const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);
    
    const nextNumber = todayTokens.length + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const prefix = patientInfo.department ? patientInfo.department.substring(0, 1).toUpperCase() : 'T';
    const newTokenId = `${prefix}-${formattedNumber}`;
    const id = generateId();

    // Smart Counter Assignment Logic
    // Find all counters serving this department, find the one with the fewest waiting tokens
    let estimatedWaitTimeMins = 0;

    if (hospital && patientInfo.department) {
       // In a real app, counters might explicitly state which departments they serve.
       // For now, we find how many people are waiting ahead in this department.
       const waitingAhead = todayTokens.filter(t => t.status === 'waiting' && t.department === patientInfo.department).length;
       estimatedWaitTimeMins = waitingAhead * 5; // 5 mins avg per patient
    }

    const newToken: Token = {
      ...patientInfo,
      id,
      tokenId: newTokenId,
      hospitalId,
      status: 'waiting',
      timestamp: Date.now(),
      estimatedWaitTimeMins,
    } as Token;

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'tokens', id), newToken);
    } else {
      set((state) => ({ tokens: [...state.tokens, newToken] }));
    }

    return newToken;
  },

  updateStatus: async (id, status, servedBy) => {
    const { tokens } = get();
    const token = tokens.find(t => t.id === id);
    if (!token || !token.id) return;

    if (isFirebaseConfigured && db) {
      const updates: any = { status };
      if (servedBy) updates.servedBy = servedBy;
      if (status === 'serving') updates.servedAt = Date.now();
      if (status === 'completed') updates.completedAt = Date.now();
      await updateDoc(doc(db, 'tokens', token.id), updates);
    } else {
      set((state) => ({
        tokens: state.tokens.map(t => 
          t.id === id 
            ? { ...t, status, ...(servedBy ? { servedBy } : {}) } 
            : t
        )
      }));
    }
  },

  updatePriority: async (id, priority) => {
    const { tokens } = get();
    const token = tokens.find(t => t.id === id);
    if (!token || !token.id) return;

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'tokens', token.id), { priority });
    } else {
      set((state) => ({
        tokens: state.tokens.map(t => t.id === id ? { ...t, priority } : t)
      }));
    }
  },

  callNext: async (counterName, department) => {
    const { tokens, updateStatus } = get();
    
    const priorityWeight: Record<string, number> = {
      disabled: 5, pregnant: 4, senior: 3, emergency: 2, normal: 0
    };

    const waitingTokens = tokens
      .filter(t => t.status === 'waiting' && (!department || t.department === department))
      .sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return a.timestamp - b.timestamp;
      });

    if (waitingTokens.length === 0) return null;

    const nextToken = waitingTokens[0];
    await updateStatus(nextToken.id!, 'serving', counterName);
    return nextToken;
  },

  updateHospital: async (hospitalId, updates) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'hospitals', hospitalId), updates as any);
    } else {
      set((state) => ({ hospital: { ...state.hospital!, ...updates } as Hospital }));
    }
  }
}));
