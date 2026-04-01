import { supabase, Profile } from './supabase';
import { createStripeCustomer } from './stripeService';

const CACHE_KEY = 'client_profile';

// ─── INSCRIPTION CLIENT ───────────────────────────────────────
export async function clientSignUp(params: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}): Promise<Profile> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        role: 'client',
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Erreur lors de la création du compte');

  // Mettre à jour le téléphone si fourni
  if (params.phone) {
    await supabase
      .from('profiles')
      .update({ phone: params.phone })
      .eq('id', data.user.id);
  }

  // Créer le customer Stripe automatiquement
  createStripeCustomer({
    clientId: data.user.id,
    email: params.email,
    name: params.fullName,
  }).catch(console.warn); // Ne pas bloquer si Stripe échoue

  const profile = await getClientProfile(data.user.id);
  localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  return profile;
}

// ─── CONNEXION CLIENT ─────────────────────────────────────────
export async function clientLogin(email: string, password: string): Promise<Profile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await getClientProfile(data.user.id);

  // Bloquer les admins sur la webapp client
  if (profile.role === 'admin') {
    await supabase.auth.signOut();
    throw new Error('Utilisez la plateforme admin pour vous connecter.');
  }

  // Bloquer les comptes désactivés
  if (profile.status === 'deactivated') {
    await supabase.auth.signOut();
    throw new Error('Votre compte a été désactivé. Contactez Dental3Design.');
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  return profile;
}

// ─── DÉCONNEXION ──────────────────────────────────────────────
export async function clientLogout(): Promise<void> {
  localStorage.removeItem(CACHE_KEY);
  await supabase.auth.signOut();
}

// ─── GET PROFIL ───────────────────────────────────────────────
export async function getClientProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

// ─── GET SESSION (avec cache) ─────────────────────────────────
export async function getClientSession(): Promise<Profile | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    if (cached) {
      const profile = JSON.parse(cached) as Profile;
      if (profile.role === 'client' && profile.status === 'active') return profile;
    }

    const profile = await getClientProfile(sessionData.session.user.id);

    if (profile.role === 'admin' || profile.status === 'deactivated') {
      await supabase.auth.signOut();
      return null;
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    return null;
  }
}

// ─── RAFRAÎCHIR LE PROFIL (ex: après achat d'unités) ─────────
export async function refreshClientProfile(userId: string): Promise<Profile> {
  const profile = await getClientProfile(userId);
  localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  return profile;
}

// ─── TROUVER L'ADMIN (pour messagerie) ────────────────────────
export async function getAdminProfile(): Promise<Profile | null> {
  const cached = localStorage.getItem('admin_profile_ref');
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (data) {
    localStorage.setItem('admin_profile_ref', JSON.stringify(data));
    return data as Profile;
  }
  return null;
}
