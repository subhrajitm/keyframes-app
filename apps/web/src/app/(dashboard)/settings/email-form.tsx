"use client";

import { useActionState } from "react";
import { updateEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: { error: string; success: string } = { error: "", success: "" };

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(updateEmail, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Current email</label>
        <Input value={currentEmail} readOnly className="cursor-not-allowed opacity-50" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">New email</label>
        <Input type="email" name="email" placeholder="new@example.com" required />
      </div>

      <p className="text-xs text-white/30">
        You'll receive confirmation emails at both addresses to complete the change.
      </p>

      <Button type="submit" size="sm" loading={isPending}>
        Update email
      </Button>
    </form>
  );
}
