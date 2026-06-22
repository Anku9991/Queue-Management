export type QueueStatus = 'waiting' | 'serving' | 'completed' | 'skipped' | 'cancelled';
export type PriorityLevel = 'normal' | 'senior' | 'emergency' | 'vip' | 'pregnant' | 'disabled';

export interface Hospital {
  id: string; // Unique hospital identifier (e.g., H001)
  hospitalName: string;
  prefix: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'disabled';
  createdAt: number;
  resetTime: string;
  counters: string[];
  departments: string[];
  floors: string[];
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'super_admin' | 'hospital_admin' | 'operator';
  hospitalId: string;
  assignedCounter?: string;
}

export interface Token {
  id?: string;
  tokenId: string; // e.g., A-001
  hospitalId: string; // Multi-tenant isolation
  patientName: string;
  mobile: string;
  age?: string;
  gender?: string;
  purpose: string;
  department: string;
  floor?: string;
  priority: PriorityLevel;
  status: QueueStatus;
  assignedCounter?: string;
  servedBy?: string;
  estimatedWaitTimeMins?: number;
  timestamp: number;
  servedAt?: number;
  completedAt?: number;
}
