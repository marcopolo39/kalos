import Link from "next/link";

export function EmptyState({ memberName }: { memberName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-black">
        Welcome to Kalos, {memberName}
      </h1>
      <p className="text-neutral-500">
        Your body composition dashboard is ready.
        <br />
        Upload your first DEXA scan to see your breakdown.
      </p>
      <Link
        href="/upload"
        className="bg-[#3083ff] hover:bg-[#1a6fe8] text-white rounded font-semibold px-5 py-[15px] text-sm leading-none tracking-tight transition-colors"
        style={{ fontFamily: "var(--font-manrope)" }}
      >
        Upload your first scan
      </Link>
      <p className="text-xs text-neutral-400">
        Your scan data is private and encrypted.
      </p>
    </div>
  );
}
