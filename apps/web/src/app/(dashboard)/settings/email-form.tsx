"use client";

import { useActionState } from "react";
import { updateEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: { error: string; success: string } = { error: "", success: "" };

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(updateEmail, initial);

  return (
    <form action={formAction} className="space-y-5">
      <p className="text-base font-medium">Change email</p>
      <Alert state={state} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">Current email</label>
        <Input value={currentEmail} readOnly className="h-12 text-base cursor-not-allowed opacity-40" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">New email</label>
        <Input type="email" name="email" placeholder="new@example.com" required className="h-12 text-base" />
      </div>

      <p className="text-sm text-white/30">
        Confirmation emails will be sent to both addresses.
      </p>

      <Button type="submit" loading={isPending} className="h-11 px-6 text-base">
        Update email
      </Button>
    </form>
  );
}

function Alert({ state }: { state: { error: string; success: string } }) {
  if (state.error) return (
    <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{state.error}</p>
  );
  if (state.success) return (
    <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">{state.success}</p>
  );
  return null;
}
