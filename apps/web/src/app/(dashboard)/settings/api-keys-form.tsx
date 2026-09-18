"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
        className="pr-10 font-mono text-sm"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ApiKeysForm({ initialFalKey, initialOpenrouterKey }: Props) {
  const [state, formAction, isPending] = useActionState(updateApiKeys, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <p className="text-xs text-white/40">
        Bring your own API keys to bypass platform credit limits. Leave a field empty to remove a key.
      </p>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">fal.ai API key</label>
        <MaskedInput name="fal_api_key" defaultValue={initialFalKey} placeholder="fal-…" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">OpenRouter API key</label>
        <MaskedInput name="openrouter_api_key" defaultValue={initialOpenrouterKey} placeholder="sk-or-…" />
      </div>

      <Button type="submit" size="sm" loading={isPending}>
        Save keys
      </Button>
    </form>
  );
}
