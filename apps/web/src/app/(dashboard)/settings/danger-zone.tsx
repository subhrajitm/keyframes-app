"use client";

import { useState } from "react";
import { deleteAccount } from "./actions";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Delete account</p>
        <p className="mt-0.5 text-xs text-white/40">
          Permanently delete your account, projects, and all generated assets. This cannot be undone.
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <form action={deleteAccount}>
            <Button type="submit" variant="destructive" size="sm">
              Yes, delete
            </Button>
          </form>
        </div>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          className="shrink-0"
          onClick={() => setConfirming(true)}
        >
          Delete account
        </Button>
      )}
    </div>
  );
}
