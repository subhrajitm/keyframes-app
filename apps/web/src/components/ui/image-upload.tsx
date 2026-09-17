"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  projectId: string;
  assetType: "character" | "location";
  shape?: "circle" | "rect";
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  projectId,
  assetType,
  shape = "rect",
  label = "Upload image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectId);
      form.append("type", assetType);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [projectId, assetType, onChange]);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) upload(file);
  }, [upload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const shapeClass = shape === "circle"
    ? "rounded-full aspect-square"
    : "rounded-lg aspect-video";

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`relative w-full overflow-hidden border-2 border-dashed transition-colors ${shapeClass} ${
          isDragging
            ? "border-violet-400 bg-violet-500/10"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
        } cursor-pointer`}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        {value ? (
          <>
            <img src={value} alt="Asset" className="h-full w-full object-cover" />
            {/* Clear button */}
            {onClear && (
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/70 hover:bg-black/80 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            ) : (
              <>
                <Upload className="h-4 w-4 text-white/20" />
                <p className="text-center text-[10px] text-white/20">{label}</p>
              </>
            )}
          </div>
        )}

        {/* Uploading overlay */}
        {isUploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
