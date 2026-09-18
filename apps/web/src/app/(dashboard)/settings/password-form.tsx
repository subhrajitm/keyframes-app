"use client";

import { useActionState } from "react";
import { updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: { error: string; success: string } = { error: "", success: "" };

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initial);

  return (
    <form action={formAction} className="space-y-5">
      <p className="text-base font-medium">Change password</p>
      <Alert state={state} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">Current password</label>
        <Input type="password" name="current_password" placeholder="••••••••" required className="h-12 text-base" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">New password</label>
        <Input type="password" name="new_password" placeholder="••••••••" required minLength={8} className="h-12 text-base" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">Confirm new password</label>
        <Input type="password" name="confirm_password" placeholder="••••••••" required className="h-12 text-base" />
      </div>

      <Button type="submit" loading={isPending} className="h-11 px-6 text-base">
        Update password
      </Button>
    </form>
  );
}

function Alert({ state }: { state: { error: string; success: string } }) {
  if (state.error) return (
    <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{state.error}</p>
  );
  if (state.success) return (
    <p className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">{state.success}</p>
  );
  return null;
}
