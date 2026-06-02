import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border-subtle bg-surface-offwhite px-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-lg border border-border-subtle bg-surface-offwhite px-3 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
