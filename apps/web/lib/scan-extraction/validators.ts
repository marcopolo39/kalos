import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export function validatePdfFile(
  file: FormDataEntryValue | null,
): { ok: false; response: NextResponse } | { ok: true; blob: Blob } {
  if (!file || !(file instanceof Blob)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, errors: [{ field: 'file', message: 'No file provided' }] },
        { status: 400 },
      ),
    };
  }
  if (file.type !== 'application/pdf' && !('name' in file && (file as File).name.endsWith('.pdf'))) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, errors: [{ field: 'file', message: 'File must be a PDF' }] },
        { status: 400 },
      ),
    };
  }
  if (file.size > 50 * 1024 * 1024) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, errors: [{ field: 'file', message: 'File exceeds 50 MB limit' }] },
        { status: 400 },
      ),
    };
  }
  return { ok: true, blob: file };
}

export async function getAuthenticatedUser(): Promise<
  { ok: false; response: NextResponse } | { ok: true; user: User; supabase: SupabaseClient }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, errors: [{ field: 'auth', message: 'Not authenticated' }] },
        { status: 401 },
      ),
    };
  }
  return { ok: true, user, supabase };
}
