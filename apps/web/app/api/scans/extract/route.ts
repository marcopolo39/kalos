import { NextResponse } from 'next/server';
import { extractScanFromPdf } from '@/lib/scan-extraction/extract';
import { validatePdfFile, getAuthenticatedUser } from '@/lib/scan-extraction/validators';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fileResult = validatePdfFile(formData.get('file'));
    if (!fileResult.ok) return fileResult.response;

    const authResult = await getAuthenticatedUser();
    if (!authResult.ok) return authResult.response;

    const pdfBytes = new Uint8Array(await fileResult.blob.arrayBuffer());
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
