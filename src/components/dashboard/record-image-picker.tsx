"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function RecordImagePicker({
  name,
  maxCount = 15,
  existingCount = 0,
  labels,
}: {
  name: string;
  maxCount?: number;
  existingCount?: number;
  labels: {
    addImages: string;
    imagesSelected: string;
    imagesRemaining: string;
    imagesNote: string;
  };
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const remaining = Math.max(maxCount - existingCount - files.length, 0);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function updateFiles(nextFiles: File[]) {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

    const nextPreviews = nextFiles.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = nextPreviews;
    setFiles(nextFiles);
    setPreviews(nextPreviews);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>
          {labels.imagesSelected} {files.length}
        </span>
        <span className="h-3 w-px bg-border-subtle" />
        <span>
          {labels.imagesRemaining} {remaining}
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          aria-label={labels.addImages}
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-offwhite text-muted transition-colors hover:border-primary/40 hover:text-primary",
            remaining === 0 && "cursor-not-allowed opacity-50",
          )}
          onClick={() => {
            if (remaining > 0) {
              inputRef.current?.click();
            }
          }}
          type="button"
        >
          <ImagePlus className="h-6 w-6" />
        </button>
        {previews.map((src, index) => (
          <div
            className="h-24 w-24 overflow-hidden rounded-2xl border border-border-subtle bg-surface-container-low"
            key={`${src}-${index}`}
          >
            <img alt="" className="h-full w-full object-cover" src={src} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">{labels.imagesNote}</p>
      <input
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        multiple
        name={name}
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          if (selected.length === 0) {
            updateFiles([]);
            return;
          }
          const next = remaining > 0 ? selected.slice(0, remaining) : [];
          updateFiles(next);
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
