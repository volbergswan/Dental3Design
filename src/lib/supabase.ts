import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rfwxttzayplpxjtntvwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmd3h0dHpheXBscHhqdG50dndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTAyNDgsImV4cCI6MjA5MDM2NjI0OH0.mogjW5evd3T221eqE0tgLtDzpBjYgA5nEV-zrGMJ8hQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'client';
  status: 'active' | 'deactivated';
  stripe_customer_id: string | null;
  units: number;
  created_at: string;
  updated_at: string;
};

export type Case = {
  id: string;
  client_id: string;
  patient_name: string;
  type: string;
  status: 'statusNone' | 'statusPending' | 'statusInProgress' | 'statusCompleted' | 'statusCancelled';
  teeth: string;
  units: number;
  instructions: string;
  created_at: string;
  updated_at: string;
};

export type CaseFile = {
  id: string;
  case_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: 'admin' | 'client';
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  case_id: string | null;
  content: string;
  is_read: boolean;
  is_mr_dent: boolean;
  created_at: string;
};

export type UnitTransaction = {
  id: string;
  client_id: string;
  type: 'purchase' | 'deduction' | 'manual_add' | 'manual_remove' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  case_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
};
