import { FirstScanHero } from "./first-scan-hero";

interface Scan {
  id: string;
  scan_date: string;
}

interface FirstScanViewProps {
  scan: Scan;
}

export function FirstScanView({ scan }: FirstScanViewProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <FirstScanHero scanDate={scan.scan_date} />
    </div>
  );
}
