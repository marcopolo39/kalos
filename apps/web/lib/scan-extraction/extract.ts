import { GoogleGenAI, MediaResolution } from '@google/genai';
import { ScanExtractionSchema, GEMINI_RESPONSE_SCHEMA } from './schema';
import type { ScanExtraction } from './schema';

const PROMPT = `Extract the following fields from this DEXA scan PDF. Return null for any field you cannot confidently locate — never guess or fill with zero.

Fields:
- scan_date: Date the scan was performed (YYYY-MM-DD)
- external_scan_id: Scanner-assigned scan identifier (e.g. 'A0622240C')
- device_model: Scanner model (e.g. 'Horizon Wi')
- device_serial: Scanner serial number
- software_version: Software version used for the scan
- weight_lb: Patient weight in pounds at time of scan
- height_in: Patient height in inches at time of scan
- tbf_pct: Total body fat percentage
- tbf_pct_pctile_yn: Total body fat % Young Normal percentile (vs peers aged 20-40)
- tbf_pct_pctile_am: Total body fat % Age Matched percentile (vs same-age peers)
- vat_area_cm2: Visceral adipose tissue area in cm²
- almi: Appendicular lean mass index (appendicular lean mass kg / height m²)
- almi_pctile_yn: ALMI Young Normal percentile
- almi_pctile_am: ALMI Age Matched percentile
- total_bmd: Total body bone mineral density (g/cm²)
- total_t_score: Total body T-score
- total_z_score: Total body Z-score
- l_arm_lean_mass, r_arm_lean_mass, trunk_lean_mass, l_leg_lean_mass, r_leg_lean_mass: The 'Lean + BMC' mass in pounds for each region. IMPORTANT: Hologic reports 'Lean + BMC Mass (lb)' which includes bone mineral content (~5% higher than pure lean mass). Extract the 'Lean + BMC Mass (lb)' column specifically.
- l_arm_fat_mass, r_arm_fat_mass, trunk_fat_mass, l_leg_fat_mass, r_leg_fat_mass: Fat mass in pounds for each region

This is a Hologic DEXA report. Key locations:
- scan_date: 'Scan Date' in the Scan Information or Patient Information section
- external_scan_id: 'Scan ID' or 'Scan Number' in the Scan Information section
- device_model, device_serial: System/Scanner section
- software_version: Software field near device info
- weight_lb, height_in: Patient Information section (convert from metric if needed)
- tbf_pct: 'Total % Fat' or 'Total Body Fat %' in Total Body Composition section
- tbf_pct_pctile_yn / _am: Percentile columns next to total fat % (YN = Young Normal, AM = Age Matched)
- vat_area_cm2: VAT Area section
- almi: 'ALMI' or 'App. Lean/Height²'
- almi_pctile_yn / _am: Percentile columns next to ALMI
- total_bmd, total_t_score, total_z_score: 'Total' row in Bone Density section
- Regional lean/fat: 'Body Composition Results' table — rows L Arm, R Arm, Trunk, L Leg, R Leg; columns 'Lean + BMC Mass (lb)' and 'Fat Mass (lb)'

Return null for any field that is not present in this PDF, cannot be read clearly, has ambiguous units, or would require inference. Never return 0 for a missing value.`;

export async function extractScanFromPdf(
  pdfBytes: Uint8Array,
): Promise<{ ok: true; data: ScanExtraction } | { ok: false; errors: { field: string; message: string }[] }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

    const base64 = Buffer.from(pdfBytes).toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-3.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
            { text: PROMPT },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_RESPONSE_SCHEMA,
        temperature: 0,
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      },
    });

    const text = response.text;
    if (!text) {
      return { ok: false, errors: [{ field: 'gemini', message: 'Empty response from model' }] };
    }

    const parsed = ScanExtractionSchema.safeParse(JSON.parse(text));
    if (parsed.success) {
      return { ok: true, data: parsed.data };
    }
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'unknown',
        message: issue.message,
      })),
    };
  } catch (err) {
    return { ok: false, errors: [{ field: 'gemini', message: String(err) }] };
  }
}
