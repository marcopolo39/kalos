import { ButtonLink } from "@/app/_components/button";

export function RegisterSuccess() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-8 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Account created!</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Your account is ready. Log in to get started.
          </p>
        </div>
        <ButtonLink href="/login" className="w-full text-sm px-5 py-[15px] text-center">
          Go to login →
        </ButtonLink>
      </div>
    </div>
  );
}
