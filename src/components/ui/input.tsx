import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border-subtle bg-surface-offwhite px-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-lg border border-border-subtle bg-surface-offwhite px-3 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-0",
        className,
      )}
      {...props}
    />
  );
}
