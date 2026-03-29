import { supabase, Case, CaseFile } from './supabase';

// ── Cas d'un lab ───────────────────────────────────────────
export async function getCasesByLab(labId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('lab_id', labId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

// ── Un cas par ID ──────────────────────────────────────────
export async function getCaseById(id: string): Promise<Case | null> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return normalize(data);
}

// ── Créer un cas ───────────────────────────────────────────
export async function createCase(payload: {
  lab_id: string;
  patient: string;
  type: string;
  tooth?: string;
  units: number;
  instructions?: string;
  files?: File[];
}): Promise<Case> {
  const { files: rawFiles, ...rest } = payload;

  const { data, error } = await supabase
    .from('cases')
    .insert({
      ...rest,
      status: 'statusPending',
      date: new Date().toISOString().split('T')[0],
      files: [],
    })
    .select()
    .single();

  if (error) throw error;
  const newCase = normalize(data);

  // Upload files if any
  if (rawFiles && rawFiles.length > 0) {
    return attachFilesToCase(newCase.id, rawFiles);
  }

  return newCase;
}

// ── Upload fichiers ────────────────────────────────────────
async function uploadFile(caseId: string, file: File): Promise<string> {
  const path = `${caseId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('case-files')
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('case-files').getPublicUrl(path);
  return data.publicUrl;
}

export async function attachFilesToCase(
  caseId: string,
  files: File[]
): Promise<Case> {
  const existing = await getCaseById(caseId);
  const current: CaseFile[] = existing?.files ?? [];

  const newFiles: CaseFile[] = await Promise.all(
    files.map(async (f) => ({
      name: f.name,
      url: await uploadFile(caseId, f),
      size: f.size,
      uploaded_at: new Date().toISOString(),
    }))
  );

  const { data, error } = await supabase
    .from('cases')
    .update({ files: [...current, ...newFiles] })
    .eq('id', caseId)
    .select()
    .single();

  if (error) throw error;
  return normalize(data);
}

// ── Écouter les cas en temps réel ─────────────────────────
// Quand l'admin change le statut → le client voit la mise à jour
export function subscribeToCases(
  labId: string,
  callback: (cases: Case[]) => void
): () => void {
  const channel = supabase
    .channel(`cases_lab_${labId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cases',
        filter: `lab_id=eq.${labId}`,
      },
      async () => {
        const cases = await getCasesByLab(labId);
        callback(cases);
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ── Normaliser ────────────────────────────────────────────
function normalize(raw: any): Case {
  return { ...raw, files: raw.files ?? [] };
}
