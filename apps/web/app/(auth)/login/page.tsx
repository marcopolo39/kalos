"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Button } from "@/app/_components/button";

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

          <Button
            type="submit"
            disabled={pending}
            className="w-full text-sm px-5 py-[15px] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {pending ? "Logging in…" : "Log in"}
          </Button>
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
