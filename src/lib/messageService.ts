import { supabase } from './supabase';
import type { Message } from './supabase';

// ─── ENVOYER UN MESSAGE ───────────────────────────────────────
export async function sendMessage(params: {
  senderId: string;
  receiverId: string;
  content: string;
  caseId?: string;
  isMrDent?: boolean;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      content: params.content,
      case_id: params.caseId || null,
      is_mr_dent: params.isMrDent || false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Message;
}

// ─── LISTER LES MESSAGES D'UNE CONVERSATION ──────────────────
export async function getConversation(userId1: string, userId2: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Message[];
}

// ─── MARQUER MESSAGES COMME LUS ──────────────────────────────
export async function markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('receiver_id', receiverId)
    .eq('sender_id', senderId)
    .eq('is_read', false);
}

// ─── REALTIME SUBSCRIPTION ────────────────────────────────────
export function subscribeToMessages(
  userId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
