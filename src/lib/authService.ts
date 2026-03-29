import { supabase, Lab } from './supabase';

// ── Inscription client (crée un compte Supabase Auth + une entrée dans labs) ──
export async function signupLab(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<Lab> {
  // 1. Créer le compte Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Erreur lors de la création du compte.');

  // 2. Créer l'entrée dans la table labs
  const { data: lab, error: labError } = await supabase
    .from('labs')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? '',
      status: 'active',
      units: 0,
      total_cases: 0,
    })
    .select()
    .single();

  if (labError) throw labError;
  return lab;
}

// ── Connexion client ───────────────────────────────────────
export async function loginLab(
  email: string,
  password: string
): Promise<{ lab: Lab }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Récupérer les données du lab depuis la table
  const { data: lab, error: labError } = await supabase
    .from('labs')
    .select('*')
    .eq('email', email)
    .single();

  if (labError || !lab) throw new Error('Compte introuvable.');
  if (lab.status === 'deactivated') {
    await supabase.auth.signOut();
    throw new Error('Ce compte a été désactivé. Contactez l\'administrateur.');
  }

  return { lab };
}

// ── Déconnexion ────────────────────────────────────────────
export async function logoutLab(): Promise<void> {
  await supabase.auth.signOut();
}

// ── Session courante ───────────────────────────────────────
export async function getLabSession(): Promise<Lab | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('email', session.user.email)
    .single();

  return lab ?? null;
}

// ── Écouter les changements de session ────────────────────
export function onLabAuthChange(
  callback: (lab: Lab | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (!session) {
        callback(null);
        return;
      }
      const { data: lab } = await supabase
        .from('labs')
        .select('*')
        .eq('email', session.user.email)
        .single();
      callback(lab ?? null);
    }
  );
  return () => subscription.unsubscribe();
}
