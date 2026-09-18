"use client";

import { useActionState } from "react";
import { updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: { error: string; success: string } = { error: "", success: "" };

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Current password</label>
        <Input type="password" name="current_password" placeholder="••••••••" required />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">New password</label>
        <Input type="password" name="new_password" placeholder="••••••••" required minLength={8} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Confirm new password</label>
        <Input type="password" name="confirm_password" placeholder="••••••••" required />
      </div>

      <Button type="submit" size="sm" loading={isPending}>
        Update password
      </Button>
    </form>
  );
}
