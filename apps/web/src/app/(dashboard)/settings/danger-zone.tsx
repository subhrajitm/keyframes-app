"use client";

import { useState } from "react";
import { deleteAccount } from "./actions";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-base font-medium">Delete account</p>
        <p className="mt-1.5 text-sm text-white/40 max-w-xs">
          Permanently deletes your account, all projects, and every generated asset. This cannot be undone.
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" onClick={() => setConfirming(false)} className="h-11 px-5 text-base">
            Cancel
          </Button>
          <form action={deleteAccount}>
            <Button type="submit" variant="destructive" className="h-11 px-5 text-base">
              Yes, delete
            </Button>
          </form>
        </div>
      ) : (
        <Button
          variant="destructive"
          className="shrink-0 h-11 px-5 text-base"
          onClick={() => setConfirming(true)}
        >
          Delete account
        </Button>
      )}
    </div>
  );
}
