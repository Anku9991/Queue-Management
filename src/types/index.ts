export type QueueStatus = 'waiting' | 'in-process' | 'completed' | 'skipped' | 'cancelled';
export type PriorityLevel = 'normal' | 'senior' | 'emergency' | 'vip' | 'pregnant' | 'disabled';

export interface Token {
  id: string;
  tokenId: string;
  patientName: string;
  mobile: string;
  age?: string;
  gender: string;
  purpose: string;
  uhid?: string;
  status: QueueStatus;
  priority: PriorityLevel;
  timestamp: number;
  servedBy?: string; // Counter Name or ID
}

export interface Settings {
  hospitalName: string;
  prefix: string;
  resetTime: string; // e.g., "00:00"
  counters: string[];
  staffList: Array<{ id: string; name: string; role: string; email: string }>;
}
