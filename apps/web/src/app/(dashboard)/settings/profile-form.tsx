"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
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
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">{state.success}</p>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold">
              {initials}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Change avatar
          </Button>
          <p className="mt-1 text-xs text-white/30">JPEG, PNG, WebP or GIF · max 5 MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Display name</label>
        <Input name="full_name" defaultValue={initialName} placeholder="Your name" required />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Email</label>
        <Input value={email} readOnly className="cursor-not-allowed opacity-50" />
        <p className="text-xs text-white/30">Change your email in the Email &amp; Password section below</p>
      </div>

      <Button type="submit" size="sm" loading={isPending}>
        Save changes
      </Button>
    </form>
  );
}
