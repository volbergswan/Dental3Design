import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ============================================
// CONFIGURATION SUPABASE
// ============================================
const supabaseUrl = 'https://mslngppailvzatttfvga.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbG5ncHBhaWx2emF0dHRmdmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjM1OTEsImV4cCI6MjA5MDYzOTU5MX0.NYUn1XU8bvWW7aeNvQxI2Dlk2Xv1V1SD6EPt2qhGy18';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTH API (Client)
// ============================================
export const authApi = {
  // Inscription
  signUp: async (email: string, password: string, fullName: string, labId: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'client',
          lab_id: labId,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // Connexion
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Utilisateur actuel
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Profil utilisateur
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  // Mettre à jour le profil
  updateProfile: async (userId: string, updates: { full_name?: string; avatar_url?: string }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Réinitialisation mot de passe
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};

// ============================================
// LAB API (Client - lecture seule de son lab)
// ============================================
export const labApi = {
  // Mon laboratoire
  getMyLab: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data: profile } = await supabase
      .from('profiles')
      .select('lab_id')
      .eq('id', user.id)
      .single();

    if (!profile?.lab_id) throw new Error('Aucun lab associé');

    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('id', profile.lab_id)
      .single();

    if (error) throw error;
    return data;
  },

  // Mes units disponibles
  getUnits: async () => {
    const lab = await labApi.getMyLab();
    return lab.units;
  },
};

// ============================================
// CASES API (Client)
// ============================================
export const casesApi = {
  // Mes dossiers
  getMyCases: async () => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Un dossier
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Créer un dossier
  create: async (caseData: {
    patient_name: string;
    prosthesis_type?: string;
    teeth?: string;
    units?: number;
    instructions?: string;
  }) => {
    // Récupérer mon lab_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data: profile } = await supabase
      .from('profiles')
      .select('lab_id')
      .eq('id', user.id)
      .single();

    if (!profile?.lab_id) throw new Error('Aucun lab associé');

    const { data, error } = await supabase
      .from('cases')
      .insert({
        ...caseData,
        lab_id: profile.lab_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un dossier
  update: async (id: string, updates: {
    patient_name?: string;
    prosthesis_type?: string;
    teeth?: string;
    instructions?: string;
  }) => {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// FILES API (Client)
// ============================================
export const filesApi = {
  // Upload un fichier
  upload: async (caseId: string, file: File) => {
    const filePath = `${caseId}/${Date.now()}_${file.name}`;
    
    // Upload vers Storage
    const { error: uploadError } = await supabase.storage
      .from('case-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Enregistrer en BDD
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('case_files')
      .insert({
        case_id: caseId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user?.id,
        is_from_admin: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mes fichiers d'un dossier
  getByCaseId: async (caseId: string) => {
    const { data, error } = await supabase
      .from('case_files')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // URL de téléchargement
  getDownloadUrl: async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('case-files')
      .createSignedUrl(filePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  },
};

// ============================================
// MESSAGES API (Client)
// ============================================
export const messagesApi = {
  // Envoyer un message
  send: async (content: string, caseId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data: profile } = await supabase
      .from('profiles')
      .select('lab_id')
      .eq('id', user.id)
      .single();

    if (!profile?.lab_id) throw new Error('Aucun lab associé');
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        lab_id: profile.lab_id,
        case_id: caseId,
        sender_id: user.id,
        content,
        is_from_admin: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mes messages
  getMyMessages: async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Marquer comme lu
  markAsRead: async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
    if (error) throw error;
  },
};

// ============================================
// NOTIFICATIONS API (Client)
// ============================================
export const notificationsApi = {
  // Mes notifications
  getAll: async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Marquer comme lu
  markAsRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },

  // Compter les non-lues
  countUnread: async () => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },
};

// ============================================
// PROSTHESIS TYPES API
// ============================================
export const prosthesisApi = {
  // Liste des types de prothèses
  getAll: async () => {
    const { data, error } = await supabase
      .from('prosthesis_types')
      .select('*')
      .order('id');
    if (error) throw error;
    return data;
  },
};

// ============================================
// CHATBOT API (Mr. Dent)
// ============================================
export const chatbotApi = {
  // Créer une conversation
  createConversation: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert({ user_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer ou créer une conversation
  getOrCreateConversation: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    // Chercher une conversation existante
    const { data: existing } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) return existing;

    // Créer une nouvelle conversation
    return chatbotApi.createConversation();
  },

  // Envoyer un message au chatbot
  sendMessage: async (conversationId: string, message: string) => {
    // Sauvegarder le message utilisateur
    await supabase
      .from('chatbot_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      });

    // Appeler l'Edge Function Mr. Dent
    const { data, error } = await supabase.functions.invoke('chat-mr-dent', {
      body: { conversationId, message },
    });

    if (error) throw error;
    return data;
  },

  // Historique d'une conversation
  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
};

// ============================================
// UNIT TRANSACTIONS API (Client - lecture seule)
// ============================================
export const transactionsApi = {
  // Mon historique de transactions
  getMyTransactions: async () => {
    const { data, error } = await supabase
      .from('unit_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
