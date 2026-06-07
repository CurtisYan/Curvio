"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RecordMarkdown } from "@/components/records/record-markdown";
import { Textarea } from "@/components/ui/input";
import type { EditorMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type PreviewMode = "write" | "preview";

export type MarkdownTextareaHandle = {
  insertMarkdown: (text: string) => void;
};

export const MarkdownTextarea = forwardRef<
  MarkdownTextareaHandle,
  {
    editorMode: EditorMode;
    labels: {
      markdownWrite: string;
      markdownPreview: string;
      markdownEmptyPreview: string;
    };
    name: string;
    placeholder: string;
    imagePreviewUrls?: Record<string, string>;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    required?: boolean;
  }
>(function MarkdownTextarea(
  { defaultValue = "", editorMode, imagePreviewUrls, labels, name, onValueChange, placeholder, required },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("write");
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function updateValue(nextValue: string) {
    setValue(nextValue);
    onValueChange?.(nextValue);
  }

  function insertMarkdownAtCursor(text: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
    const nextCursor = start + text.length;

    setPreviewMode("write");
    updateValue(nextValue);
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  }

  useEffect(() => {
    function onInsertMarkdown(event: Event) {
      const customEvent = event as CustomEvent<{ markdown?: string }>;
      const markdown = customEvent.detail?.markdown;

      if (typeof markdown === "string" && markdown) {
        insertMarkdownAtCursor(markdown);
      }
    }

    window.addEventListener("curvio:insert-markdown", onInsertMarkdown);

    return () => {
      window.removeEventListener("curvio:insert-markdown", onInsertMarkdown);
    };
  });

  useImperativeHandle(ref, () => ({
    insertMarkdown(text: string) {
      insertMarkdownAtCursor(text);
    },
  }));

  const isMarkdown = editorMode === "markdown";

  return (
    <div className="space-y-2">
      {isMarkdown ? (
        <div className="inline-grid grid-cols-2 overflow-hidden rounded-lg border border-border-subtle bg-surface">
          {(["write", "preview"] as const).map((nextMode) => (
            <button
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                previewMode === nextMode
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-surface-container-low hover:text-primary",
                nextMode === "preview" && "border-l border-border-subtle",
              )}
              key={nextMode}
              onClick={() => setPreviewMode(nextMode)}
              type="button"
            >
              {nextMode === "write" ? labels.markdownWrite : labels.markdownPreview}
            </button>
          ))}
        </div>
      ) : null}
      <input name={name} type="hidden" value={value} />
      {!isMarkdown || previewMode === "write" ? (
        <Textarea
          onDragOver={(event) => {
            if (
              event.dataTransfer.types.includes("application/x-curvio-markdown") ||
              event.dataTransfer.types.includes("application/x-curvio-image-token")
            ) {
              event.preventDefault();
            }
          }}
          onDrop={(event) => {
            const markdown =
              event.dataTransfer.getData("application/x-curvio-markdown") ||
              event.dataTransfer.getData("text/plain");

            if (!markdown.includes("curvio-image:")) {
              return;
            }

            event.preventDefault();
            insertMarkdownAtCursor(markdown);
          }}
          onChange={(event) => updateValue(event.target.value)}
          placeholder={placeholder}
          ref={textareaRef}
          required={required}
          value={value}
        />
      ) : (
        <div className="min-h-32 rounded-lg border border-border-subtle bg-surface-offwhite px-3 py-3">
          {value.trim() ? (
            <RecordMarkdown imagePreviewUrls={imagePreviewUrls}>{value}</RecordMarkdown>
          ) : (
            <p className="text-sm text-muted">{labels.markdownEmptyPreview}</p>
          )}
        </div>
      )}
    </div>
  );
});
