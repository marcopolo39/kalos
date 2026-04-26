import { ButtonLink } from "@/app/_components/button";

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
      <ButtonLink href="/upload" className="px-5 py-[15px] text-sm">
        Upload your first scan
      </ButtonLink>
      <p className="text-xs text-neutral-400">
        Your scan data is private and encrypted.
      </p>
    </div>
  );
}
