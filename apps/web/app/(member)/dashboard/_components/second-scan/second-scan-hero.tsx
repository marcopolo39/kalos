import { formatDate, daysBetween } from "@/lib/scan-display/format";

interface SecondScanHeroProps {
  previousDate: string;
  currentDate: string;
}

export function SecondScanHero({ previousDate, currentDate }: SecondScanHeroProps) {
  const days = daysBetween(previousDate, currentDate);
  const interval =
    days < 14
      ? `${days} days`
      : days < 60
        ? `${Math.round(days / 7)} weeks`
        : `${Math.round(days / 30)} months`;

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-black mb-1">Your Progress</h1>
      <p className="text-neutral-500 text-sm">
        {formatDate(previousDate)} → {formatDate(currentDate)}
        <span className="mx-2 text-neutral-300">·</span>
        <span className="font-medium text-neutral-700">{interval} between scans</span>
      </p>
    </div>
  );
}
