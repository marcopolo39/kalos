import { ButtonLink } from "@/app/_components/button";

export function FirstScanCta() {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 flex flex-col items-center text-center gap-4">
      <p className="text-neutral-900 text-base">
        Now that you&apos;ve seen your data, let&apos;s set some goals.
      </p>
      <ButtonLink href="/goals" className="px-6 py-2.5 text-sm">
        Set your goals
      </ButtonLink>
    </div>
  );
}
