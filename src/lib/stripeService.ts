import { supabase } from './supabase';

// ─── STRIPE CONFIG (public key from env) ──────────────────────
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

export const UNIT_PACKS = [
  {
    id: 'pack_1',
    units: 1,
    priceId: 'price_1TGl3Z1odnrffqWCnMZwyTwb',
    price: 9.90,
    label: '1 Unit',
    popular: false,
  },
  {
    id: 'pack_10',
    units: 10,
    priceId: 'price_1TGl4I1odnrffqWCQU5SacAz',
    price: 89.90,
    label: '10 Units',
    popular: false,
  },
  {
    id: 'pack_50',
    units: 50,
    priceId: 'price_1TGl4x1odnrffqWCEMQsBXwH',
    price: 395,
    label: '50 Units',
    popular: true,
  },
  {
    id: 'pack_100',
    units: 100,
    priceId: 'price_1TGl5b1odnrffqWCu4xtjn7o',
    price: 690,
    label: '100 Units',
    popular: false,
  },
] as const;

// ─── CRÉER SESSION STRIPE CHECKOUT ───────────────────────────
export async function createCheckoutSession(params: {
  priceId: string;
  units: number;
  clientId: string;
  stripeCustomerId?: string;
}): Promise<{ url: string; sessionId: string }> {
  const { data, error } = await supabase.functions.invoke('create-stripe-session', {
    body: {
      price_id: params.priceId,
      units: params.units,
      client_id: params.clientId,
      stripe_customer_id: params.stripeCustomerId || null,
      success_url: `${window.location.origin}?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}?stripe=cancel`,
    },
  });

  if (error) throw new Error(error.message || 'Erreur Stripe');
  if (!data?.url) throw new Error('URL de paiement non reçue');

  return { url: data.url, sessionId: data.session_id };
}

// ─── VÉRIFIER PAIEMENT STRIPE ─────────────────────────────────
export async function handleStripeReturn(sessionId: string): Promise<{ success: boolean; units: number }> {
  const { data, error } = await supabase.functions.invoke('stripe-verify', {
    body: { sessionId },
  });

  if (error) throw new Error(error.message || 'Erreur vérification Stripe');

  return {
    success: data?.success || false,
    units: data?.units || 0,
  };
}

// ─── CRÉER CUSTOMER STRIPE ───────────────────────────────────
export async function createStripeCustomer(params: {
  clientId: string;
  email: string;
  name: string;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
      body: {
        client_id: params.clientId,
        email: params.email,
        name: params.name,
      },
    });

    if (error) throw error;
    return data?.customer_id || null;
  } catch {
    return null;
  }
}
