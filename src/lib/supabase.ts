import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rfwxttzayplpxjtntvwb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmd3h0dHpheXBscHhqdG50dndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTAyNDgsImV4cCI6MjA5MDM2NjI0OH0.mogjW5evd3T221eqE0tgLtDzpBjYgA5nEV-zrGMJ8hQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ────────────────────────────────────────────────
export type CaseStatus =
  | 'statusNone'
  | 'statusPending'
  | 'statusInProgress'
  | 'statusCompleted'
  | 'statusCancelled';

export interface Lab {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'warning' | 'deactivated';
  units: number;
  total_cases: number;
  created_at: string;
  updated_at: string;
}

export interface CaseFile {
  name: string;
  url: string;
  size: number;
  uploaded_at: string;
}

export interface Case {
  id: string;
  lab_id: string;
  patient: string;
  type: string;
  status: CaseStatus;
  date: string;
  tooth?: string;
  units: number;
  instructions?: string;
  files?: CaseFile[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  lab_id: string;
  sender: 'admin' | 'lab';
  content: string;
  read: boolean;
  created_at: string;
}
