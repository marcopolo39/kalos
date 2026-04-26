import { ButtonLink } from "./button";

export function Hero() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
      <span className="text-blue-700 text-xs font-semibold uppercase tracking-widest mb-4">
        Body composition tracking
      </span>
      <h1 className="text-black text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-5">
        Know your body.
        <br />
        Track what matters.
      </h1>
      <p className="text-neutral-500 text-lg max-w-md mb-10">
        Upload your DEXA scans and see exactly how your body composition changes
        over time — fat, muscle, and bone, all in one place.
      </p>
      <div className="flex items-center gap-4">
        <ButtonLink href="/register" className="px-8 py-5 text-base">
          Get started
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary" className="px-8 py-5 text-base">
          Log in
        </ButtonLink>
      </div>
    </section>
  );
}
