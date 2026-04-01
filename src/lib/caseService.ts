import { supabase, Case, CaseFile } from './supabase';

const CACHE_PREFIX = 'cases_cache_';

// ─── HELPERS CACHE ────────────────────────────────────────────
function getCached<T>(key: string, maxAgeMs = 20000): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > maxAgeMs) return null;
    return data as T;
  } catch { return null; }
}

function setCache(key: string, data: unknown): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function clearCasesCache(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

// ─── GÉNÉRER ID CAS ───────────────────────────────────────────
async function generateCaseId(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_case_id');
  if (error) {
    // Fallback si la fonction RPC échoue
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900) + 100;
    return `CAS-${year}-${rand}`;
  }
  return data as string;
}

// ─── ADMIN: LISTER TOUS LES CAS ───────────────────────────────
export async function getAllCases(): Promise<(Case & { client_email?: string; client_name?: string })[]> {
  const cached = getCached<Case[]>('all');
  if (cached) return cached;

  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      profiles!cases_client_id_fkey (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const result = (data || []).map((c: any) => ({
    ...c,
    client_email: c.profiles?.email || '',
    client_name: c.profiles?.full_name || '',
  }));

  setCache('all', result);
  return result;
}

// ─── CLIENT: LISTER SES CAS ───────────────────────────────────
export async function getClientCases(clientId: string): Promise<Case[]> {
  const cacheKey = `client_${clientId}`;
  const cached = getCached<Case[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const result = (data || []) as Case[];
  setCache(cacheKey, result);
  return result;
}

// ─── CRÉER UN CAS (client) ────────────────────────────────────
export async function createCase(params: {
  clientId: string;
  patientName: string;
  type: string;
  teeth: string;
  units: number;
  instructions: string;
}): Promise<Case> {
  const id = await generateCaseId();

  const { data, error } = await supabase
    .from('cases')
    .insert({
      id,
      client_id: params.clientId,
      patient_name: params.patientName,
      type: params.type,
      teeth: params.teeth,
      units: params.units,
      instructions: params.instructions,
      status: 'statusPending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  clearCasesCache();
  return data as Case;
}

// ─── METTRE À JOUR LE STATUT (admin) ──────────────────────────
export async function updateCaseStatus(caseId: string, status: Case['status']): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ status })
    .eq('id', caseId);

  if (error) throw new Error(error.message);
  clearCasesCache();
}

// ─── SUPPRIMER UN CAS (admin) ─────────────────────────────────
export async function deleteCase(caseId: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', caseId);

  if (error) throw new Error(error.message);
  clearCasesCache();
}

// ─── UPLOAD FICHIER ───────────────────────────────────────────
export async function uploadCaseFile(params: {
  caseId: string;
  file: File;
  uploadedBy: 'admin' | 'client';
  userId: string;
}): Promise<CaseFile> {
  const bucket = params.uploadedBy === 'client' ? 'case-files-client' : 'case-files-admin';
  const filePath = `${params.userId}/${params.caseId}/${Date.now()}_${params.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, params.file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error: dbError } = await supabase
    .from('case_files')
    .insert({
      case_id: params.caseId,
      file_name: params.file.name,
      file_path: filePath,
      file_size: params.file.size,
      file_type: params.file.name.split('.').pop()?.toLowerCase() || 'other',
      uploaded_by: params.uploadedBy,
    })
    .select()
    .single();

  if (dbError) throw new Error(dbError.message);
  return data as CaseFile;
}

// ─── LISTER FICHIERS D'UN CAS ─────────────────────────────────
export async function getCaseFiles(caseId: string): Promise<CaseFile[]> {
  const { data, error } = await supabase
    .from('case_files')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as CaseFile[];
}

// ─── TÉLÉCHARGER UN FICHIER ───────────────────────────────────
export async function downloadCaseFile(filePath: string, uploadedBy: 'admin' | 'client'): Promise<string> {
  const bucket = uploadedBy === 'client' ? 'case-files-client' : 'case-files-admin';

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600); // URL valide 1h

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ─── DÉDUIRE UNITÉS APRÈS LIVRAISON ──────────────────────────
export async function deductUnitsForCase(caseId: string, clientId: string, units: number): Promise<void> {
  // Récupérer solde actuel
  const { data: profile } = await supabase
    .from('profiles')
    .select('units')
    .eq('id', clientId)
    .single();

  if (!profile) return;

  const newBalance = Math.max(0, profile.units - units);

  await supabase.from('profiles').update({ units: newBalance }).eq('id', clientId);

  await supabase.from('unit_transactions').insert({
    client_id: clientId,
    type: 'deduction',
    amount: units,
    balance_after: newBalance,
    description: `Déduction pour cas ${caseId}`,
    case_id: caseId,
  });
}
