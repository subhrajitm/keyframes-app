"use client";

import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: { error: string; success: string } = { error: "", success: "" };

interface Props {
  initialName: string;
  email: string;
  initialAvatarUrl: string;
}

export function ProfileForm({ initialName, email, initialAvatarUrl }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfile, initial);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(data.url);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const initials = initialName
    ? initialName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email[0]?.toUpperCase() ?? "?";

  return (
    <form action={formAction} className="space-y-6">
      <Alert state={state} />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="group relative h-20 w-20 shrink-0 rounded-full overflow-hidden focus:outline-none"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-violet-600 text-2xl font-semibold">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <span className="material-symbols-rounded text-[22px] animate-spin">progress_activity</span>
              : <span className="material-symbols-rounded text-[22px]">photo_camera</span>
            }
          </div>
        </button>

        <div>
          <p className="text-base font-medium">{initialName || "Your name"}</p>
          <p className="mt-1 text-sm text-white/40">{email}</p>
          <p className="mt-2 text-xs text-white/25">Click avatar to change · JPEG, PNG, WebP · max 5 MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }}
        />
      </div>

      <Field label="Display name">
        <Input name="full_name" defaultValue={initialName} placeholder="Your name" required className="h-12 text-base" />
      </Field>

      <Button type="submit" loading={isPending} className="h-11 px-6 text-base">
        Save changes
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/50">{label}</label>
      {children}
    </div>
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
