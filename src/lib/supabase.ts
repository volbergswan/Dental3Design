import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ============================================
// SUPABASE CLIENT
// ============================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================
// RE-EXPORT TYPES
// ============================================
export type {
  Profile,
  Case,
  CaseFile,
  Message,
  UnitTransaction,
  Notification,
  ChatbotConversation,
  ChatbotMessage,
  ProsthesisType,
  CaseStatus,
  ProfileStatus,
  TransactionType,
} from './database.types';
