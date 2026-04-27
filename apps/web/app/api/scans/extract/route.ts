import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractScanFromPdf } from '@/lib/scan-extraction/extract';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'file', message: 'No file provided' }] },
        { status: 400 },
      );
    }
    if (file.type !== 'application/pdf' && !('name' in file && (file as File).name.endsWith('.pdf'))) {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'file', message: 'File must be a PDF' }] },
        { status: 400 },
      );
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'file', message: 'File exceeds 50 MB limit' }] },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'auth', message: 'Not authenticated' }] },
        { status: 401 },
      );
    }

    const pdfBytes = new Uint8Array(await file.arrayBuffer());
    const extraction = await extractScanFromPdf(pdfBytes);

    if (!extraction.ok) {
      return NextResponse.json({ ok: false, errors: extraction.errors }, { status: 422 });
    }

    return NextResponse.json({ ok: true, data: extraction.data });
  } catch (err) {
    console.error('Extract route error:', err);
    return NextResponse.json(
      { ok: false, errors: [{ field: 'server', message: 'Something went wrong' }] },
      { status: 500 },
    );
  }
}
