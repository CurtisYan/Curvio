import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-offwhite p-6 transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]",
        className,
      )}
      {...props}
    />
  );
}
