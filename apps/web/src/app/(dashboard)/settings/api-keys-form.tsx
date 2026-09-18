"use client";

import { useActionState, useState } from "react";
import { updateApiKeys } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: { error: string; success: string } = { error: "", success: "" };

interface Props {
  initialFalKey: string;
  initialOpenrouterKey: string;
}

function MaskedInput({ name, defaultValue, placeholder }: { name: string; defaultValue: string; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 pr-12 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
      >
        <span className="material-symbols-rounded text-[20px]">
          {visible ? "visibility_off" : "visibility"}
        </span>
      </button>
    </div>
  );
}

export function ApiKeysForm({ initialFalKey, initialOpenrouterKey }: Props) {
  const [state, formAction, isPending] = useActionState(updateApiKeys, initial);

  return (
    <form action={formAction} className="space-y-6">
      <Alert state={state} />

      <p className="text-sm text-white/40">
        Bring your own keys to bypass platform credit limits. Leave a field empty to remove a saved key.
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">fal.ai API key</label>
        <MaskedInput name="fal_api_key" defaultValue={initialFalKey} placeholder="fal-…" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/50">OpenRouter API key</label>
        <MaskedInput name="openrouter_api_key" defaultValue={initialOpenrouterKey} placeholder="sk-or-…" />
      </div>

      <Button type="submit" loading={isPending} className="h-11 px-6 text-base">
        Save keys
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
