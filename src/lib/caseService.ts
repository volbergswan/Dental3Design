import { supabase } from './supabase';
import type { Case, CaseFile } from './supabase';

// ─── CACHE ────────────────────────────────────────────────────
const cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 15_000; // 15s

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key: string, data: any) {
  cache[key] = { data, ts: Date.now() };
}

function clearCasesCache() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}

// ─── GÉNÉRER ID CAS ──────────────────────────────────────────
async function generateCaseId(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true });

  const num = ((count || 0) + 1).toString().padStart(3, '0');
  return `CAS-${year}-${num}`;
}

// ─── LISTER SES CAS ──────────────────────────────────────────
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

// ─── CRÉER UN CAS ─────────────────────────────────────────────
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
      prosthesis_type: params.type,
      teeth: params.teeth,
      units: params.units,
      instructions: params.instructions,
      status: 'statusNone',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  clearCasesCache();
  return data as Case;
}

// ─── METTRE À JOUR UN CAS ────────────────────────────────────
export async function updateCase(caseId: string, updates: Partial<Case>): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId);

  if (error) throw new Error(error.message);
  clearCasesCache();
}

// ─── UPLOAD FICHIER (bucket unifié: case-files) ───────────────
export async function uploadCaseFile(params: {
  caseId: string;
  file: File;
  uploadedBy: string;
  isFromAdmin: boolean;
}): Promise<CaseFile> {
  const folder = params.isFromAdmin ? 'admin' : 'client';
  const filePath = `${params.caseId}/${folder}/${Date.now()}_${params.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('case-files')
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
      is_from_admin: params.isFromAdmin,
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

// ─── TÉLÉCHARGER UN FICHIER (bucket unifié) ───────────────────
export async function downloadCaseFile(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('case-files')
    .createSignedUrl(filePath, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ─── DÉDUIRE UNITÉS APRÈS LIVRAISON ──────────────────────────
export async function deductUnitsForCase(caseId: string, clientId: string, units: number): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('units')
    .eq('id', clientId)
    .single();

  if (!profile) return;

  const newBalance = Math.max(0, (profile as any).units - units);

  await supabase.from('profiles').update({ units: newBalance }).eq('id', clientId);

  await supabase.from('unit_transactions').insert({
    client_id: clientId,
    type: 'usage' as const,
    amount: units,
    balance_after: newBalance,
    description: `Déduction pour cas ${caseId}`,
    case_id: caseId,
  });
}
