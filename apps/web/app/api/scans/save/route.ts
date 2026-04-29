import { NextResponse } from 'next/server';
import { ScanExtractionSchema } from '@/lib/scan-extraction/schema';
import { uploadScanPdf } from '@/lib/scan-extraction/storage';
import { validatePdfFile, getAuthenticatedUser } from '@/lib/scan-extraction/validators';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dataField = formData.get('data');

    const fileResult = validatePdfFile(formData.get('file'));
    if (!fileResult.ok) return fileResult.response;

    if (!dataField || typeof dataField !== 'string') {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'data', message: 'No data provided' }] },
        { status: 400 },
      );
    }

    const authResult = await getAuthenticatedUser();
    if (!authResult.ok) return authResult.response;
    const { user, supabase } = authResult;

    let parsed: unknown;
    try {
      parsed = JSON.parse(dataField);
    } catch {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'data', message: 'Invalid JSON' }] },
        { status: 400 },
      );
    }

    const validated = ScanExtractionSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          ok: false,
          errors: validated.error.issues.map((issue) => ({
            field: issue.path.join('.') || 'unknown',
            message: issue.message,
          })),
        },
        { status: 422 },
      );
    }

    if (!validated.data.scan_date) {
      return NextResponse.json(
        { ok: false, errors: [{ field: 'scan_date', message: 'Scan date is required' }] },
        { status: 422 },
      );
    }

    const scanId = crypto.randomUUID();
    const pdfBytes = new Uint8Array(await fileResult.blob.arrayBuffer());
    const uploadResult = await uploadScanPdf(user.id, scanId, pdfBytes);
    if (!uploadResult.ok) {
      console.error('Storage upload error:', uploadResult.error);
      return NextResponse.json(
        { ok: false, errors: [{ field: 'server', message: 'Failed to store PDF. Please try again.' }] },
        { status: 500 },
      );
    }

    const { error: insertError } = await supabase.from('scans').insert({
      id: scanId,
      member_id: user.id,
      scan_date: validated.data.scan_date,
      external_scan_id: validated.data.external_scan_id ?? `manual-${scanId}`,
      source_pdf_path: uploadResult.path,
      device_model: validated.data.device_model,
      device_serial: validated.data.device_serial,
      software_version: validated.data.software_version,
      weight_lb: validated.data.weight_lb,
      height_in: validated.data.height_in,
      tbf_pct: validated.data.tbf_pct,
      tbf_pct_pctile_yn: validated.data.tbf_pct_pctile_yn,
      tbf_pct_pctile_am: validated.data.tbf_pct_pctile_am,
      vat_area_cm2: validated.data.vat_area_cm2,
      almi: validated.data.almi,
      almi_pctile_yn: validated.data.almi_pctile_yn,
      almi_pctile_am: validated.data.almi_pctile_am,
      total_bmd: validated.data.total_bmd,
      total_t_score: validated.data.total_t_score,
      total_z_score: validated.data.total_z_score,
      total_lean_mass: validated.data.total_lean_mass,
      total_fat_mass: validated.data.total_fat_mass,
      l_arm_lean_mass: validated.data.l_arm_lean_mass,
      l_arm_fat_mass: validated.data.l_arm_fat_mass,
      r_arm_lean_mass: validated.data.r_arm_lean_mass,
      r_arm_fat_mass: validated.data.r_arm_fat_mass,
      trunk_lean_mass: validated.data.trunk_lean_mass,
      trunk_fat_mass: validated.data.trunk_fat_mass,
      l_leg_lean_mass: validated.data.l_leg_lean_mass,
      l_leg_fat_mass: validated.data.l_leg_fat_mass,
      r_leg_lean_mass: validated.data.r_leg_lean_mass,
      r_leg_fat_mass: validated.data.r_leg_fat_mass,
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
        { ok: false, errors: [{ field: 'server', message: 'Something went wrong' }] },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, scanId });
  } catch (err) {
    console.error('Save route error:', err);
    return NextResponse.json(
      { ok: false, errors: [{ field: 'server', message: 'Something went wrong' }] },
      { status: 500 },
    );
  }
}
