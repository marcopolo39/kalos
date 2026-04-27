import { createClient } from '@/lib/supabase/server';

export async function uploadScanPdf(
  memberId: string,
  scanId: string,
  pdfBytes: Uint8Array,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const path = `${memberId}/${scanId}.pdf`;
  const { error } = await supabase.storage
    .from('scans')
    .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}
