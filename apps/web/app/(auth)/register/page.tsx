"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Create your account
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Start your Kalos journey today
          </p>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-neutral-900">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alex Johnson"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <p className="text-xs text-neutral-500">Minimum 8 characters</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="dob" className="text-sm font-medium text-neutral-900">
              Date of birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              required
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sex" className="text-sm font-medium text-neutral-900">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              required
              defaultValue=""
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#3083ff] hover:bg-[#1a6fe8] text-white text-sm font-semibold rounded px-5 py-[15px] leading-none tracking-tight transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}
