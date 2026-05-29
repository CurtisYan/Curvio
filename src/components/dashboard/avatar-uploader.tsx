"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvatarUploader({
  avatarUrl,
  initials,
  name = "avatar",
  label,
  helpText,
  changeLabel,
}: {
  avatarUrl?: string | null;
  initials: string;
  name?: string;
  label: string;
  helpText: string;
  changeLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-3">
      <button
        className="group relative h-28 w-28 overflow-hidden rounded-full border border-border-subtle bg-surface-container-high text-xl font-medium text-primary"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-cover bg-center",
            (previewUrl ?? avatarUrl) ? "text-transparent" : "text-primary",
          )}
          style={
            previewUrl || avatarUrl
              ? { backgroundImage: `url(${previewUrl ?? avatarUrl})` }
              : undefined
          }
        >
          {initials}
        </span>
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-4 w-4" />
          {changeLabel}
        </span>
      </button>
      <div className="space-y-1 text-xs text-muted">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p>{helpText}</p>
      </div>
      <input
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        name={name}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          const nextPreview = URL.createObjectURL(file);
          setPreviewUrl((current) => {
            if (current) {
              URL.revokeObjectURL(current);
            }
            return nextPreview;
          });
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
