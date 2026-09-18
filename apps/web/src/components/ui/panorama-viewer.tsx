"use client";

import { useRef, useState, useCallback } from "react";

interface PanoramaViewerProps {
  url: string;
  className?: string;
}

export function PanoramaViewer({ url, className = "" }: PanoramaViewerProps) {
  const [posX, setPosX] = useState(50); // 0–100%
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    const containerW = containerRef.current.offsetWidth;
    // 200% image width means full drag across container = full pan
    const deltaPct = (dx / containerW) * 100;
    setPosX((p) => Math.max(0, Math.min(100, p - deltaPct)));
  }, []);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    lastX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const dx = e.touches[0].clientX - lastX.current;
    lastX.current = e.touches[0].clientX;
    const containerW = containerRef.current.offsetWidth;
    const deltaPct = (dx / containerW) * 100;
    setPosX((p) => Math.max(0, Math.min(100, p - deltaPct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        cursor: isDragging.current ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      <img
        src={url}
        alt="Location panorama"
        draggable={false}
        style={{
          width: "200%",
          height: "100%",
          objectFit: "cover",
          transform: `translateX(-${posX / 2}%)`,
          transition: isDragging.current ? "none" : "transform 0.1s ease",
          display: "block",
        }}
      />

      {/* Pan hint */}
      <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/60">
        <span className="material-symbols-rounded text-[11px]">open_with</span>
        drag to pan
      </div>
    </div>
  );
}
