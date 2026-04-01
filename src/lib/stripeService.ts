import { supabase } from './supabase';

// ─── STRIPE CONFIG ────────────────────────────────────────────
export const STRIPE_PUBLIC_KEY = 'pk_test_51T9vi21odnrffqWCYwLj3b8KMnNCB3aajffgluf7UCc5G3VaAumRIHwVDqZi6Sz7kYJ0fAvPtRNwUjmdu31E49Ev00UjjtHDUS';

export const UNIT_PACKS = [
  {
    id: 'pack_1',
    units: 1,
    priceId: 'price_1TGl3Z1odnrffqWCnMZwyTwb',
    price: 12,      // prix en EUR à adapter
    label: '1 Unit',
    popular: false,
  },
  {
    id: 'pack_10',
    units: 10,
    priceId: 'price_1TGl4I1odnrffqWCQU5SacAz',
    price: 100,
    label: '10 Units',
    popular: false,
  },
  {
    id: 'pack_50',
    units: 50,
    priceId: 'price_1TGl4x1odnrffqWCEMQsBXwH',
    price: 450,
    label: '50 Units',
    popular: true,
  },
  {
    id: 'pack_100',
    units: 100,
    priceId: 'price_1TGl5b1odnrffqWCu4xtjn7o',
    price: 800,
    label: '100 Units',
    popular: false,
  },
] as const;

// ─── CRÉER SESSION STRIPE CHECKOUT ───────────────────────────
// Cette fonction appelle une Supabase Edge Function qui crée la session
// (la clé secrète Stripe ne doit JAMAIS être dans le frontend)
export async function createCheckoutSession(params: {
  priceId: string;
  units: number;
  clientId: string;
  stripeCustomerId?: string | null;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-stripe-session', {
    body: {
      price_id: params.priceId,
      units: params.units,
      client_id: params.clientId,
      stripe_customer_id: params.stripeCustomerId || null,
      success_url: `${window.location.origin}?payment=success&units=${params.units}`,
      cancel_url: `${window.location.origin}?payment=cancelled`,
    },
  });

  if (error) throw new Error(error.message || 'Erreur lors de la création de la session de paiement');
  if (!data?.url) throw new Error('URL de paiement non reçue');

  return data.url as string;
}

// ─── TRAITER RETOUR STRIPE APRÈS PAIEMENT ────────────────────
export async function handleStripeReturn(
  clientId: string,
  units: number
): Promise<number> {
  // Récupérer solde actuel
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('units')
    .eq('id', clientId)
    .single();

  if (profileError) throw new Error(profileError.message);

  const currentUnits = profile.units as number;
  const newBalance = currentUnits + units;

  // Mettre à jour le solde
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ units: newBalance })
    .eq('id', clientId);

  if (updateError) throw new Error(updateError.message);

  // Enregistrer la transaction
  await supabase.from('unit_transactions').insert({
    client_id: clientId,
    type: 'purchase',
    amount: units,
    balance_after: newBalance,
    description: `Achat de ${units} unités via Stripe`,
    stripe_session_id: new URLSearchParams(window.location.search).get('session_id') || '',
  });

  // Nettoyer l'URL
  const url = new URL(window.location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('units');
  url.searchParams.delete('session_id');
  window.history.replaceState({}, '', url.toString());

  return newBalance;
}

// ─── CRÉER CUSTOMER STRIPE ────────────────────────────────────
// Appelé automatiquement lors de l'inscription d'un client
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

    if (error || !data?.customer_id) return null;

    // Sauvegarder l'ID customer dans le profil
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: data.customer_id })
      .eq('id', params.clientId);

    return data.customer_id as string;
  } catch {
    return null;
  }
}
