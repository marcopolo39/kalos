"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to your Kalos account
          </p>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

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
              autoComplete="current-password"
              required
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#3083ff] hover:bg-[#1a6fe8] text-white text-sm font-semibold rounded px-5 py-[15px] leading-none tracking-tight transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Get started →
          </Link>
        </p>
      </div>
    </div>
  );
}
