import { formatDateShort } from "@/lib/scan-display/format";

interface ScanRow {
  id: string;
  scan_date: string;
  weight_lb: number | null;
  tbf_pct: number | null;
  total_lean_mass: number | null;
  vat_area_cm2: number | null;
}

interface ScanHistoryTableProps {
  scans: ScanRow[];
  signedUrls: Record<string, string>;
}

function fmt(v: number | null, dec = 1): string {
  return v !== null ? v.toFixed(dec) : "—";
}

export function ScanHistoryTable({ scans, signedUrls }: ScanHistoryTableProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm mt-4 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-bold text-black">Scan History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs text-neutral-500 uppercase tracking-wide">
              <th className="text-left px-6 py-3 font-medium">Date</th>
              <th className="text-right px-4 py-3 font-medium">Weight (lb)</th>
              <th className="text-right px-4 py-3 font-medium">Body Fat %</th>
              <th className="text-right px-4 py-3 font-medium">Lean Mass (lb)</th>
              <th className="text-right px-4 py-3 font-medium">VAT (cm²)</th>
              <th className="text-right px-6 py-3 font-medium">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {scans.map((scan) => {
              const url = signedUrls[scan.id];
              return (
                <tr key={scan.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3 text-neutral-900 font-medium">
                    {formatDateShort(scan.scan_date)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {fmt(scan.weight_lb, 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {scan.tbf_pct !== null ? `${fmt(scan.tbf_pct)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {fmt(scan.total_lean_mass)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {fmt(scan.vat_area_cm2, 0)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
