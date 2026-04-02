// ============================================
// DATABASE TYPES - Dental3Design
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'client';
export type LabStatus = 'active' | 'warning' | 'deactivated';
export type CaseStatus = 'statusNone' | 'statusPending' | 'statusInProgress' | 'statusCompleted' | 'statusCancelled';
export type TransactionType = 'add' | 'remove' | 'purchase' | 'usage';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          lab_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          lab_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          lab_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      labs: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          units: number;
          total_cases: number;
          status: LabStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          units?: number;
          total_cases?: number;
          status?: LabStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          units?: number;
          total_cases?: number;
          status?: LabStatus;
          updated_at?: string;
        };
      };
      cases: {
        Row: {
          id: string;
          lab_id: string | null;
          patient_name: string;
          prosthesis_type: string | null;
          teeth: string | null;
          units: number;
          status: CaseStatus;
          instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lab_id?: string | null;
          patient_name: string;
          prosthesis_type?: string | null;
          teeth?: string | null;
          units?: number;
          status?: CaseStatus;
          instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          lab_id?: string | null;
          patient_name?: string;
          prosthesis_type?: string | null;
          teeth?: string | null;
          units?: number;
          status?: CaseStatus;
          instructions?: string | null;
          updated_at?: string;
        };
      };
      case_files: {
        Row: {
          id: string;
          case_id: string | null;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_type: string | null;
          uploaded_by: string | null;
          is_from_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id?: string | null;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          file_type?: string | null;
          uploaded_by?: string | null;
          is_from_admin?: boolean;
          created_at?: string;
        };
        Update: {
          case_id?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_type?: string | null;
          uploaded_by?: string | null;
          is_from_admin?: boolean;
        };
      };
      unit_transactions: {
        Row: {
          id: string;
          lab_id: string | null;
          amount: number;
          type: TransactionType;
          description: string | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lab_id?: string | null;
          amount: number;
          type: TransactionType;
          description?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          lab_id?: string | null;
          amount?: number;
          type?: TransactionType;
          description?: string | null;
          performed_by?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          lab_id: string | null;
          case_id: string | null;
          sender_id: string | null;
          content: string;
          is_from_admin: boolean;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          lab_id?: string | null;
          case_id?: string | null;
          sender_id?: string | null;
          content: string;
          is_from_admin?: boolean;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          lab_id?: string | null;
          case_id?: string | null;
          sender_id?: string | null;
          content?: string;
          is_from_admin?: boolean;
          is_read?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          link?: string | null;
        };
      };
      chatbot_conversations: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          updated_at?: string;
        };
      };
      chatbot_messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: {
          conversation_id?: string | null;
          role?: 'user' | 'assistant';
          content?: string;
        };
      };
      prosthesis_types: {
        Row: {
          id: string;
          name_fr: string;
          name_en: string;
          name_es: string;
          cost: number;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name_fr: string;
          name_en: string;
          name_es: string;
          cost: number;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          name_fr?: string;
          name_en?: string;
          name_es?: string;
          cost?: number;
          icon?: string | null;
        };
      };
    };
    Views: {
      admin_dashboard_stats: {
        Row: {
          total_labs: number;
          total_cases: number;
          cases_in_progress: number;
          cases_pending: number;
          cases_completed: number;
          total_units: number;
        };
      };
      cases_with_lab: {
        Row: {
          id: string;
          lab_id: string | null;
          patient_name: string;
          prosthesis_type: string | null;
          teeth: string | null;
          units: number;
          status: CaseStatus;
          instructions: string | null;
          created_at: string;
          updated_at: string;
          lab_name: string | null;
          lab_email: string | null;
        };
      };
    };
  };
}

// ============================================
// HELPER TYPES
// ============================================
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Lab = Database['public']['Tables']['labs']['Row'];
export type Case = Database['public']['Tables']['cases']['Row'];
export type CaseFile = Database['public']['Tables']['case_files']['Row'];
export type UnitTransaction = Database['public']['Tables']['unit_transactions']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type ChatbotConversation = Database['public']['Tables']['chatbot_conversations']['Row'];
export type ChatbotMessage = Database['public']['Tables']['chatbot_messages']['Row'];
export type ProsthesisType = Database['public']['Tables']['prosthesis_types']['Row'];

export type CaseWithLab = Database['public']['Views']['cases_with_lab']['Row'];
export type DashboardStats = Database['public']['Views']['admin_dashboard_stats']['Row'];
