import { supabase, Message } from './supabase';

export async function getMessages(labId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('lab_id', labId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessageToAdmin(
  labId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ lab_id: labId, sender: 'lab', content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markAdminMessagesAsRead(labId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('lab_id', labId)
    .eq('sender', 'admin')
    .eq('read', false);
}

export async function getUnreadFromAdmin(labId: string): Promise<number> {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('lab_id', labId)
    .eq('sender', 'admin')
    .eq('read', false);
  return count ?? 0;
}

export function subscribeToMessages(
  labId: string,
  callback: (messages: Message[]) => void
): () => void {
  const channel = supabase
    .channel(`msg_lab_${labId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `lab_id=eq.${labId}`,
      },
      async () => {
        const msgs = await getMessages(labId);
        callback(msgs);
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
