import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { surfaceHover } from "./interactive";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        `inline-flex items-center gap-1 rounded bg-surface-container px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted ${surfaceHover}`,
        className,
      )}
      {...props}
    />
  );
}
