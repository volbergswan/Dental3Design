import { supabase, Lab } from './supabase';

const LAB_CACHE_KEY = 'd3d_lab_session';

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
  if (!authData.user) throw new Error('Erreur lors de la creation du compte.');

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

export async function loginLab(
  email: string,
  password: string
): Promise<{ lab: Lab }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: lab, error: labError } = await supabase
    .from('labs')
    .select('*')
    .eq('email', email)
    .single();

  if (labError || !lab) {
    await supabase.auth.signOut();
    throw new Error("Acces refuse. Ce compte est reserve a l'administration.");
  }

  if (lab.status === 'deactivated') {
    await supabase.auth.signOut();
    throw new Error("Ce compte a ete desactive. Contactez l'administrateur.");
  }

  saveLabToCache(lab);
  return { lab };
}

export async function logoutLab(): Promise<void> {
  clearLabCache();
  await supabase.auth.signOut();
}

export async function getLabSession(): Promise<Lab | null> {
  const cached = getLabFromCache();
  if (cached) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) clearLabCache();
    });
    return cached;
  }

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

export async function refreshLabData(labId: string): Promise<Lab | null> {
  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('id', labId)
    .single();
  if (lab) saveLabToCache(lab);
  return lab ?? null;
}

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
