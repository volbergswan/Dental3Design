import { useState, useEffect, useCallback } from 'react';
import { supabase, authApi, labApi, casesApi, filesApi, messagesApi, notificationsApi, prosthesisApi, chatbotApi } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, Lab, Case, CaseFile, Message, Notification, ProsthesisType, ChatbotMessage } from '../lib/database.types';

// ============================================
// useAuth - Gestion de l'authentification
// ============================================
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        authApi.getProfile(session.user.id).then(setProfile).catch(console.error);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await authApi.getProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.signIn(email, password);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, labId: string) => {
    setLoading(true);
    try {
      const data = await authApi.signUp(email, password, fullName, labId);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await authApi.resetPassword(email);
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

// ============================================
// useMyLab - Mon laboratoire
// ============================================
export function useMyLab() {
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLab = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await labApi.getMyLab();
      setLab(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLab();
  }, [fetchLab]);

  return {
    lab,
    loading,
    error,
    refresh: fetchLab,
    units: lab?.units ?? 0,
  };
}

// ============================================
// useMyCases - Mes dossiers
// ============================================
export function useMyCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await casesApi.getMyCases();
      setCases(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const createCase = async (caseData: Parameters<typeof casesApi.create>[0]) => {
    const newCase = await casesApi.create(caseData);
    setCases(prev => [newCase, ...prev]);
    return newCase;
  };

  const updateCase = async (id: string, updates: Parameters<typeof casesApi.update>[1]) => {
    const updatedCase = await casesApi.update(id, updates);
    setCases(prev => prev.map(c => c.id === id ? updatedCase : c));
    return updatedCase;
  };

  return {
    cases,
    loading,
    error,
    refresh: fetchCases,
    createCase,
    updateCase,
  };
}

// ============================================
// useCaseFiles - Fichiers d'un dossier
// ============================================
export function useCaseFiles(caseId: string | null) {
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const data = await filesApi.getByCaseId(caseId);
      setFiles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const uploadFile = async (file: File) => {
    if (!caseId) return;
    setUploading(true);
    try {
      const newFile = await filesApi.upload(caseId, file);
      setFiles(prev => [newFile, ...prev]);
      return newFile;
    } finally {
      setUploading(false);
    }
  };

  const getDownloadUrl = async (filePath: string) => {
    return filesApi.getDownloadUrl(filePath);
  };

  return {
    files,
    loading,
    uploading,
    refresh: fetchFiles,
    uploadFile,
    getDownloadUrl,
  };
}

// ============================================
// useMessages - Mes messages
// ============================================
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await messagesApi.getMyMessages();
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content: string, caseId?: string) => {
    const newMessage = await messagesApi.send(content, caseId);
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('my-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    loading,
    refresh: fetchMessages,
    sendMessage,
  };
}

// ============================================
// useNotifications - Mes notifications
// ============================================
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    await notificationsApi.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Écouter les nouvelles notifications
  useEffect(() => {
    const channel = supabase
      .channel('my-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
  };
}

// ============================================
// useProsthesisTypes - Types de prothèses
// ============================================
export function useProsthesisTypes() {
  const [types, setTypes] = useState<ProsthesisType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prosthesisApi.getAll()
      .then(setTypes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { types, loading };
}

// ============================================
// useChatbot - Mr. Dent
// ============================================
export function useChatbot() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Initialiser la conversation
  const initConversation = useCallback(async () => {
    setLoading(true);
    try {
      const conversation = await chatbotApi.getOrCreateConversation();
      setConversationId(conversation.id);
      const msgs = await chatbotApi.getMessages(conversation.id);
      setMessages(msgs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  // Envoyer un message
  const sendMessage = async (content: string) => {
    if (!conversationId || sending) return;
    
    setSending(true);
    
    // Ajouter le message utilisateur localement
    const userMessage: ChatbotMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: conversationId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatbotApi.sendMessage(conversationId, content);
      
      // Ajouter la réponse de Mr. Dent
      const assistantMessage: ChatbotMessage = {
        id: response.messageId || 'temp-assistant-' + Date.now(),
        conversation_id: conversationId,
        role: 'assistant',
        content: response.reply,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      return response;
    } catch (err) {
      // Retirer le message utilisateur en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      throw err;
    } finally {
      setSending(false);
    }
  };

  // Démarrer une nouvelle conversation
  const newConversation = async () => {
    const conversation = await chatbotApi.createConversation();
    setConversationId(conversation.id);
    setMessages([]);
    return conversation;
  };

  return {
    conversationId,
    messages,
    loading,
    sending,
    sendMessage,
    newConversation,
  };
}

// ============================================
// useRealtime - Écouter les changements
// ============================================
export function useRealtime(table: string, callback: (payload: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
