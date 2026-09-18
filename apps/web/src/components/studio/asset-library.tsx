"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Asset } from "@keyframe/types";

type AssetFilter = "all" | "character" | "location" | "image" | "video";

const TYPE_ICONS: Record<string, string> = {
  character: "person",
  location:  "location_on",
  image:     "image",
  video:     "videocam",
};

const TYPE_NODE: Record<string, string> = {
  character: "character",
  location:  "location",
  image:     "imageGen",
  video:     "videoGen",
};

const FILTER_TABS: { value: AssetFilter; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "character", label: "Characters" },
  { value: "location",  label: "Locations" },
  { value: "image",     label: "Images" },
  { value: "video",     label: "Videos" },
];

export function AssetLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<AssetFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
    setAssets(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? assets : assets.filter((a) => a.type === filter);

  const onDragStart = useCallback((e: React.DragEvent, asset: Asset) => {
    const nodeType = TYPE_NODE[asset.type] ?? "imageGen";
    e.dataTransfer.setData("application/keyframe-node", nodeType);
    e.dataTransfer.setData("application/keyframe-asset", JSON.stringify({
      id: asset.id,
      url: asset.url,
      name: asset.name,
      type: asset.type,
    }));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Filter tabs */}
      <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/10 px-2 py-1.5 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              filter === tab.value
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <button
          onClick={load}
          className="ml-auto shrink-0 rounded-md p-1 text-white/20 hover:text-white/50"
          title="Refresh"
        >
          <span className="material-symbols-rounded text-[13px]">refresh</span>
        </button>
      </div>

      {/* Assets grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-rounded text-[20px] animate-spin text-white/20">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="material-symbols-rounded text-[24px] text-white/10">image</span>
            <p className="text-[10px] text-white/20">
              {filter === "all"
                ? "No assets yet — upload reference images or generate locations"
                : `No ${filter} assets yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => onDragStart(e, asset)}
                className="group flex cursor-grab flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-1.5 transition-colors hover:border-white/10 hover:bg-white/[0.05] active:cursor-grabbing"
                title={`Drag to canvas — ${asset.name}`}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden rounded bg-white/5">
                  {asset.type === "video" ? (
                    <video
                      src={asset.url}
                      className="aspect-video w-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className={`w-full object-cover ${
                        asset.type === "character" ? "aspect-[3/4]" : "aspect-video"
                      }`}
                    />
                  )}

                  {/* Type badge */}
                  <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/60 p-0.5 text-white/60">
                    <span className="material-symbols-rounded text-[14px]">{TYPE_ICONS[asset.type] ?? "image"}</span>
                  </div>

                  {/* Drag hint on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-[10px] text-white/80">Drag to canvas</p>
                  </div>
                </div>

                <p className="truncate text-[10px] text-white/50">{asset.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
