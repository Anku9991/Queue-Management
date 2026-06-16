import { create } from 'zustand';
import type { Token, QueueStatus, PriorityLevel, Settings } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface QueueState {
  tokens: Token[];
  settings: Settings;
  
  // Actions
  initListeners: () => void;
  generateToken: (patientInfo: Omit<Token, 'id' | 'tokenId' | 'status' | 'timestamp'>) => Promise<Token>;
  updateStatus: (tokenId: string, status: QueueStatus, servedBy?: string) => Promise<void>;
  updatePriority: (tokenId: string, priority: PriorityLevel) => Promise<void>;
  callNext: (counterName: string) => Promise<Token | null>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useQueueStore = create<QueueState>((set, get) => ({
  tokens: [],
  settings: {
    hospitalName: 'Medanta Enterprise',
    prefix: 'A-',
    resetTime: '00:00'
  },

  initListeners: () => {
    if (!isFirebaseConfigured || !db) return;

    // Listen to tokens
    const q = query(collection(db, 'tokens'), orderBy('timestamp', 'asc'));
    onSnapshot(q, (snapshot) => {
      const liveTokens: Token[] = [];
      snapshot.forEach((doc) => liveTokens.push(doc.data() as Token));
      set({ tokens: liveTokens });
    });

    // Listen to settings
    onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        set({ settings: docSnap.data() as Settings });
      }
    });
  },

  generateToken: async (patientInfo) => {
    const { tokens, settings } = get();
    const today = new Date().toDateString();
    const todayTokens = tokens.filter(t => new Date(t.timestamp).toDateString() === today);
    
    const nextNumber = todayTokens.length + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const newTokenId = `${settings.prefix}${formattedNumber}`;
    const id = generateId();

    const newToken: Token = {
      ...patientInfo,
      id,
      tokenId: newTokenId,
      status: 'waiting',
      timestamp: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'tokens', id), newToken);
    } else {
      set((state) => ({ tokens: [...state.tokens, newToken] }));
    }

    return newToken;
  },

  updateStatus: async (tokenId, status, servedBy) => {
    const { tokens } = get();
    const token = tokens.find(t => t.tokenId === tokenId);
    if (!token) return;

    if (isFirebaseConfigured && db) {
      const updates: any = { status };
      if (servedBy) updates.servedBy = servedBy;
      await updateDoc(doc(db, 'tokens', token.id), updates);
    } else {
      set((state) => ({
        tokens: state.tokens.map(t => 
          t.tokenId === tokenId 
            ? { ...t, status, ...(servedBy ? { servedBy } : {}) } 
            : t
        )
      }));
    }
  },

  updatePriority: async (tokenId, priority) => {
    const { tokens } = get();
    const token = tokens.find(t => t.tokenId === tokenId);
    if (!token) return;

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'tokens', token.id), { priority });
    } else {
      set((state) => ({
        tokens: state.tokens.map(t => t.tokenId === tokenId ? { ...t, priority } : t)
      }));
    }
  },

  callNext: async (counterName) => {
    const { tokens, updateStatus } = get();
    
    const priorityWeight: Record<PriorityLevel, number> = {
      vip: 5, emergency: 4, pregnant: 3, senior: 2, disabled: 1, normal: 0
    };

    const waitingTokens = tokens.filter(t => t.status === 'waiting')
      .sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return a.timestamp - b.timestamp;
      });

    if (waitingTokens.length === 0) return null;

    const nextToken = waitingTokens[0];
    await updateStatus(nextToken.tokenId, 'in-process', counterName);
    return nextToken;
  },

  updateSettings: async (newSettings) => {
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'settings', 'global'), newSettings, { merge: true });
    } else {
      set((state) => ({ settings: { ...state.settings, ...newSettings } }));
    }
  }
}));
