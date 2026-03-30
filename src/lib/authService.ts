import { supabase, Lab } from './supabase';

const LAB_CACHE_KEY = 'd3d_lab_session';

// ── Cache local ────────────────────────────────────────────
function saveLabToCache(lab: Lab) {
  try { localStorage.setItem(LAB_CACHE_KEY, JSON.stringify(lab)); } catch {}
}
function getLabFromCache(): Lab | null {
  try {
    const raw = localStorage.getItem(LAB_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearLabCache() {
  try { localStorage.removeItem(LAB_CACHE_KEY); } catch {}
}

// ── Inscription ────────────────────────────────────────────
export async function signupLab(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<Lab> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Erreur lors de la création du compte.');

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
  saveLabToCache(lab);
  return lab;
}

// ── Connexion ──────────────────────────────────────────────
export async function loginLab(
  email: string,
  password: string
): Promise<{ lab: Lab }> {
  // 1. Auth Supabase
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // 2. Vérifier que c'est bien un compte lab (pas un admin)
  const { data: lab, error: labError } = await supabase
    .from('labs')
    .select('*')
    .eq('email', email)
    .single();

  if (labError || !lab) {
    // Pas dans la table labs = compte admin → refuser l'accès
    await supabase.auth.signOut();
    throw new Error("Accès refusé. Ce compte est réservé à l'administration.");
  }

  if (lab.status === 'deactivated') {
    await supabase.auth.signOut();
    throw new Error("Ce compte a été désactivé. Contactez l'administrateur.");
  }

  // 3. Sauvegarder en cache local
  saveLabToCache(lab);
  return { lab };
}

// ── Déconnexion ────────────────────────────────────────────
export async function logoutLab(): Promise<void> {
  clearLabCache();
  await supabase.auth.signOut();
}

// ── Session au chargement ──────────────────────────────────
// Retourne immédiatement depuis le cache, puis vérifie en arrière-plan
export async function getLabSession(): Promise<Lab | null> {
  // D'abord vérifier le cache local (instantané)
  const cached = getLabFromCache();
  if (cached) {
    // Vérifier en arrière-plan que la session Supabase est toujours valide
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) clearLabCache();
    });
    return cached;
  }

  // Pas de cache → vérifier Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return null;

    const { data: lab } = await supabase
      .from('labs')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (lab) saveLabToCache(lab);
    return lab ?? null;
  } catch {
    return null;
  }
}

// ── Rafraîchir les données du lab depuis Supabase ─────────
export async function refreshLabData(labId: string): Promise<Lab | null> {
  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('id', labId)
    .single();
  if (lab) saveLabToCache(lab);
  return lab ?? null;
}

// ── Écouter les changements de session ────────────────────
export function onLabAuthChange(
  callback: (lab: Lab | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearLabCache();
        callback(null);
        return;
      }
      if (!session?.user?.email) return;

      // Pour TOKEN_REFRESHED on ne refait pas l'appel labs
      if (event === 'TOKEN_REFRESHED') return;

      const { data: lab } = await supabase
        .from('labs')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (lab) { saveLabToCache(lab); callback(lab); }
      else callback(null);
    }
  );
  return () => subscription.unsubscribe();
}
