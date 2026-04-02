import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, Lab } from '../lib/database.types';

// ============================================
// TYPES
// ============================================
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  lab: Lab | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, labId: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le profil et le lab
  const loadUserData = async (userId: string) => {
    try {
      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Charger le lab si associé
      if (profileData.lab_id) {
        const { data: labData, error: labError } = await supabase
          .from('labs')
          .select('*')
          .eq('id', profileData.lab_id)
          .single();

        if (!labError && labData) {
          setLab(labData);
        }
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setProfile(null);
      setLab(null);
    }
  };

  // Initialisation
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setLab(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Écouter les changements de mon lab (units, status)
  useEffect(() => {
    if (!lab?.id) return;

    const channel = supabase
      .channel(`lab:${lab.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'labs',
          filter: `id=eq.${lab.id}`,
        },
        (payload) => {
          setLab(payload.new as Lab);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lab?.id]);

  // Connexion
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Vérifier que c'est un client (pas admin)
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, lab_id')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData.role === 'admin') {
          await supabase.auth.signOut();
          throw new Error('Utilisez l\'interface administrateur pour vous connecter.');
        }

        // Vérifier que le lab est actif
        if (profileData.lab_id) {
          const { data: labData } = await supabase
            .from('labs')
            .select('status')
            .eq('id', profileData.lab_id)
            .single();

          if (labData?.status === 'deactivated') {
            await supabase.auth.signOut();
            throw new Error('Votre compte a été désactivé. Contactez l\'administrateur.');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const signUp = async (email: string, password: string, fullName: string, labId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLab(null);
  };

  // Réinitialisation mot de passe
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      lab,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// PROTECTED ROUTE (Client)
// ============================================
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
