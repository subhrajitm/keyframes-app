"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupWithEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { error: "" };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupWithEmail, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1 text-sm text-white/50">Start making AI films for free</p>
        </div>

        <form action={formAction} className="space-y-3">
          {state.error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}
          <Input type="text" name="full_name" placeholder="Full name" required />
          <Input type="email" name="email" placeholder="Email" required />
          <Input
            type="password"
            name="password"
            placeholder="Password (8+ characters)"
            minLength={8}
            required
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Create account
          </Button>
        </form>

        <p className="text-center text-xs text-white/30">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>

        <p className="text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
