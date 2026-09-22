"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "./node-wrapper";
import type { KFNode } from "@/store/project-store";

export const LocationNode = memo(({ id, data }: NodeProps<KFNode>) => {
  const imageUrl = data.locationImageUrl as string | undefined;

  return (
    <NodeWrapper
      id={id}
      title="Location"
      icon="location_on"
      avatarColor="#10b981"
      avatarIcon="landscape"
      imageSlot={
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-white/[0.025]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={data.locationName ?? "Location"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="material-symbols-rounded text-[40px] text-white/[0.07]">landscape</span>
          )}
        </div>
      }
    >
      <p className="text-[12px] text-white/45">
        {(data.locationName as string) || "Unnamed location"}
      </p>
      {data.locationDescription ? (
        <p className="mt-1.5 line-clamp-2 text-[11px] text-white/25">
          {data.locationDescription as string}
        </p>
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        id="location-out"
        className="!h-2.5 !w-2.5 !rounded-full !border !border-white/15 !bg-[#161616]"
      />
    </NodeWrapper>
  );
});

LocationNode.displayName = "LocationNode";
