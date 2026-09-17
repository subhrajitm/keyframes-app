"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MapPin } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const LocationNode = memo(({ id, data }: NodeProps<KFNode>) => {
  return (
    <NodeWrapper id={id} accentColor="#22c55e" icon="🗺" title="Location">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-20 w-full overflow-hidden rounded-lg ring-1 ring-green-500/20">
          {data.locationImageUrl ? (
            <img
              src={data.locationImageUrl as string}
              alt={data.locationName ?? "Location"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-green-500/10">
              <MapPin className="h-7 w-7 text-green-400/60" />
            </div>
          )}
        </div>
        <p className="text-center text-sm font-medium text-white/80">
          {data.locationName || "Unnamed Location"}
        </p>
        {data.locationDescription ? (
          <p className="line-clamp-2 text-center text-xs text-white/40">
            {data.locationDescription as string}
          </p>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="location-out"
        className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-[#0f0f1a]"
      />
    </NodeWrapper>
  );
});

LocationNode.displayName = "LocationNode";
