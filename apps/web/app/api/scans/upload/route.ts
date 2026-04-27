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

    if (!extraction.data.scan_date) {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'scan_date', message: 'Could not extract scan date from PDF' }] },
        { status: 422 },
      );
    }

    const scanId = crypto.randomUUID();
    const storagePath = `${user.id}/${scanId}.pdf`;

    const { error: insertError } = await supabase.from('scans').insert({
      id: scanId,
      member_id: user.id,
      scan_date: extraction.data.scan_date,
      external_scan_id: extraction.data.external_scan_id ?? `manual-${scanId}`,
      source_pdf_path: storagePath,
      device_model: extraction.data.device_model,
      device_serial: extraction.data.device_serial,
      software_version: extraction.data.software_version,
      weight_lb: extraction.data.weight_lb,
      height_in: extraction.data.height_in,
      tbf_pct: extraction.data.tbf_pct,
      tbf_pct_pctile_yn: extraction.data.tbf_pct_pctile_yn,
      tbf_pct_pctile_am: extraction.data.tbf_pct_pctile_am,
      vat_area_cm2: extraction.data.vat_area_cm2,
      almi: extraction.data.almi,
      almi_pctile_yn: extraction.data.almi_pctile_yn,
      almi_pctile_am: extraction.data.almi_pctile_am,
      total_bmd: extraction.data.total_bmd,
      total_t_score: extraction.data.total_t_score,
      total_z_score: extraction.data.total_z_score,
      l_arm_lean_mass: extraction.data.l_arm_lean_mass,
      l_arm_fat_mass: extraction.data.l_arm_fat_mass,
      r_arm_lean_mass: extraction.data.r_arm_lean_mass,
      r_arm_fat_mass: extraction.data.r_arm_fat_mass,
      trunk_lean_mass: extraction.data.trunk_lean_mass,
      trunk_fat_mass: extraction.data.trunk_fat_mass,
      l_leg_lean_mass: extraction.data.l_leg_lean_mass,
      l_leg_fat_mass: extraction.data.l_leg_fat_mass,
      r_leg_lean_mass: extraction.data.r_leg_lean_mass,
      r_leg_fat_mass: extraction.data.r_leg_fat_mass,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { ok: false, duplicate: true, message: 'This scan is already on file.' },
          { status: 409 },
        );
      }
      console.error('Scan insert error:', insertError);
      return NextResponse.json(
        { ok: false, errors: [{ field: 'server', message: 'Failed to save scan' }] },
        { status: 500 },
      );
    }

    const { error: storageError } = await supabase.storage
      .from('scans')
      .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: false });

    if (storageError) {
      console.error('Storage upload error (scan row saved):', storageError);
    }

    return NextResponse.json({ ok: true, scanId });
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { ok: false, errors: [{ field: 'server', message: 'Something went wrong' }] },
      { status: 500 },
    );
  }
}
