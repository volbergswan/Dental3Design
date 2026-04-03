// ─── MR. DENT — Chatbot IA Dental3Design ──────────────────────
// Appelle la Supabase Edge Function "mr-dent" — clé Anthropic côté serveur uniquement

import { supabase } from './supabase';

export interface MrDentMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── ENVOYER UN MESSAGE À MR. DENT ───────────────────────────
export async function askMrDent(
  messages: MrDentMessage[],
  userMessage: string
): Promise<string> {
  const allMessages: MrDentMessage[] = [
    ...messages,
    { role: 'user', content: userMessage },
  ];

  try {
    const { data, error } = await supabase.functions.invoke('mr-dent', {
      body: { messages: allMessages },
    });

    if (error) throw new Error(error.message || 'Erreur Edge Function mr-dent');
    if (!data?.response) throw new Error('Réponse vide de Mr. Dent');

    return data.response as string;
  } catch (error: any) {
    console.error('Mr. Dent error:', error);
    throw new Error('Mr. Dent est temporairement indisponible. Veuillez réessayer.');
  }
}

// ─── SAUVEGARDER L'HISTORIQUE CHAT ───────────────────────────
export function saveChatHistory(userId: string, messages: MrDentMessage[]): void {
  try {
    localStorage.setItem(
      `mr_dent_history_${userId}`,
      JSON.stringify(messages.slice(-20))
    );
  } catch {}
}

export function loadChatHistory(userId: string): MrDentMessage[] {
  try {
    const raw = localStorage.getItem(`mr_dent_history_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
