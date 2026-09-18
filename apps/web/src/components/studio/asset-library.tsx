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
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-3 py-2.5 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.value
                ? "bg-white/10 text-white/85"
                : "text-white/40 hover:text-white/65"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <button
          onClick={load}
          className="ml-auto shrink-0 rounded-lg p-1.5 text-white/30 hover:text-white/60 transition-colors"
          title="Refresh"
        >
          <span className="material-symbols-rounded text-[16px]">refresh</span>
        </button>
      </div>

      {/* Assets grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <span className="material-symbols-rounded animate-spin text-[20px] text-white/20">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="material-symbols-rounded text-[32px] text-white/10">image</span>
            <p className="text-sm leading-relaxed text-white/30">
              {filter === "all"
                ? "No assets yet"
                : `No ${filter} assets yet`}
            </p>
            {filter === "all" && (
              <p className="text-xs text-white/20">Upload reference images or generate locations</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => onDragStart(e, asset)}
                className="group flex cursor-grab flex-col gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1.5 transition-colors hover:border-white/10 hover:bg-white/[0.05] active:cursor-grabbing"
                title={`Drag to canvas — ${asset.name}`}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden rounded-lg bg-white/[0.04]">
                  {asset.type === "video" ? (
                    <video src={asset.url} className="aspect-video w-full object-cover" muted />
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
                  <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-black/60 px-1 py-0.5 text-white/60 backdrop-blur-sm">
                    <span className="material-symbols-rounded text-[12px]">{TYPE_ICONS[asset.type] ?? "image"}</span>
                  </div>

                  {/* Drag hint */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="material-symbols-rounded text-[18px] text-white/70">drag_indicator</span>
                  </div>
                </div>

                <p className="truncate px-0.5 text-xs text-white/50">{asset.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
