"use client";

import { ImagePlus, TextCursorInput, Trash2 } from "lucide-react";
import type { DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ImageVisibility = "public" | "private";

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

type ImageItem = {
  file: File;
  preview: string;
  token: string;
  visibility: ImageVisibility;
};

function createImageToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function syncInputFiles(input: HTMLInputElement | null, items: ImageItem[]) {
  if (!input) {
    return;
  }

  const dataTransfer = new DataTransfer();
  items.forEach((item) => dataTransfer.items.add(item.file));
  input.files = dataTransfer.files;
}

export function RecordImagePicker({
  name,
  maxCount = 15,
  existingCount = 0,
  labels,
  onInsertImage,
  onPreviewUrlsChange,
  hidden = false,
}: {
  name: string;
  maxCount?: number;
  existingCount?: number;
  hidden?: boolean;
  labels: {
    addImages: string;
    imagesSelected: string;
    imagesRemaining: string;
    imagesNote: string;
    imagePublic: string;
    imagePrivate: string;
    insertImage: string;
    imageMarkdownAlt?: string;
    privateImageInsertHint: string;
    imageTooLarge: string;
    imageTypeUnsupported: string;
    deleteImage?: string;
  };
  onInsertImage?: (token: string) => void;
  onPreviewUrlsChange?: (previewUrls: Record<string, string>) => void;
}) {
  const pickerInputRef = useRef<HTMLInputElement | null>(null);
  const submitInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<ImageItem[]>([]);
  const autoInsertNextFilesRef = useRef(false);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const remaining = Math.max(maxCount - existingCount - items.length, 0);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  useEffect(() => {
    function onOpenImagePicker(event: Event) {
      if (remaining === 0) {
        return;
      }

      const customEvent = event as CustomEvent<{ insert?: boolean }>;
      autoInsertNextFilesRef.current = Boolean(customEvent.detail?.insert);
      pickerInputRef.current?.click();
    }

    window.addEventListener("curvio:open-image-picker", onOpenImagePicker);

    return () => {
      window.removeEventListener("curvio:open-image-picker", onOpenImagePicker);
    };
  }, [remaining]);

  function updateItems(nextItems: ImageItem[]) {
    itemsRef.current = nextItems;
    setItems(nextItems);
    syncInputFiles(submitInputRef.current, nextItems);
    onPreviewUrlsChange?.(
      Object.fromEntries(nextItems.map((item) => [item.token, item.preview])),
    );
  }

  function updateVisibility(index: number, visibility: ImageVisibility) {
    const nextItems = items.map((item, currentIndex) =>
      currentIndex === index ? { ...item, visibility } : item,
    );
    itemsRef.current = nextItems;
    setItems(nextItems);
  }

  function addFiles(selectedFiles: File[]) {
    if (selectedFiles.length === 0) {
      return;
    }

    setErrorMessage("");
    const acceptedFiles: File[] = [];
    for (const file of selectedFiles) {
      if (!allowedImageTypes.has(file.type)) {
        setErrorMessage(labels.imageTypeUnsupported);
        continue;
      }

      if (file.size > maxImageSize) {
        setErrorMessage(labels.imageTooLarge);
        continue;
      }

      acceptedFiles.push(file);
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const newItems = acceptedFiles.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      token: createImageToken(),
      visibility: "public" as const,
    }));
    const nextItems = [...itemsRef.current, ...newItems];
    updateItems(nextItems);

    if (autoInsertNextFilesRef.current) {
      autoInsertNextFilesRef.current = false;
      window.setTimeout(() => {
        newItems.forEach((item) => insertImage(item));
      }, 0);
    }
  }

  function removeImage(index: number) {
    const target = items[index];
    if (!target) {
      return;
    }

    URL.revokeObjectURL(target.preview);
    updateItems(items.filter((_item, currentIndex) => currentIndex !== index));
  }

  function createImageMarkdown(item: ImageItem) {
    return `\n\n![${labels.imageMarkdownAlt ?? item.file.name}|100%](curvio-image:${item.token})\n\n`;
  }

  function setImageDragData(event: DragEvent<HTMLElement>, item: ImageItem) {
    if (item.visibility !== "public") {
      event.preventDefault();
      return;
    }

    const markdown = createImageMarkdown(item);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-curvio-image-token", item.token);
    event.dataTransfer.setData("application/x-curvio-preview-url", item.preview);
    event.dataTransfer.setData("application/x-curvio-markdown", markdown);
    event.dataTransfer.setData("text/plain", markdown);

    const dragImage = event.currentTarget.querySelector("img");
    if (dragImage) {
      event.dataTransfer.setDragImage(
        dragImage,
        Math.min(dragImage.width / 2, 72),
        Math.min(dragImage.height / 2, 48),
      );
    }
  }

  function insertImage(item: ImageItem) {
    const markdown = createImageMarkdown(item);

    if (onInsertImage) {
      onInsertImage(item.token);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("curvio:insert-markdown", {
        detail: { markdown, previewUrl: item.preview, token: item.token },
      }),
    );
  }

  const pickerInput = (
    <input
      accept="image/png,image/jpeg,image/webp"
      className="sr-only"
      multiple
      onChange={(event) => {
        addFiles(Array.from(event.target.files ?? []));
        event.currentTarget.value = "";
      }}
      ref={pickerInputRef}
      type="file"
    />
  );
  const submitInput = <input className="sr-only" multiple name={name} ref={submitInputRef} type="file" />;

  const hiddenFields = items.map((item) => (
    <span key={item.token}>
      <input name="image_visibility" type="hidden" value={item.visibility} />
      <input name="image_token" type="hidden" value={item.token} />
    </span>
  ));

  if (hidden) {
    return (
      <div className="sr-only">
        {hiddenFields}
        {pickerInput}
        {submitInput}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>
          {labels.imagesSelected} {items.length}
        </span>
        <span className="h-3 w-px bg-border-subtle" />
        <span>
          {labels.imagesRemaining} {remaining}
        </span>
      </div>
      {errorMessage ? (
        <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-xs leading-5 text-error">
          {errorMessage}
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-wrap gap-3 rounded-xl border border-transparent transition-colors",
          isDraggingOver && "border-primary/30 bg-primary/5",
        )}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDraggingOver(false);
          }
        }}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setIsDraggingOver(true);
          }
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.files.length) {
            return;
          }

          event.preventDefault();
          setIsDraggingOver(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <button
          aria-label={labels.addImages}
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-offwhite text-muted transition-colors hover:border-primary/40 hover:text-primary",
            remaining === 0 && "cursor-not-allowed opacity-50",
          )}
          onClick={() => {
            if (remaining > 0) {
              pickerInputRef.current?.click();
            }
          }}
          type="button"
        >
          <ImagePlus className="h-6 w-6" />
        </button>
        {items.map((item, index) => (
          <div
            className={cn(
              "group w-36 overflow-hidden rounded-2xl border border-border-subtle bg-surface-container-low",
            )}
            key={item.token}
          >
            <div
              className={cn(
                "relative h-24 w-full",
                item.visibility === "public" && "cursor-grab active:cursor-grabbing",
              )}
              draggable={item.visibility === "public"}
              onDragStart={(event) => setImageDragData(event, item)}
            >
              <img
                alt=""
                className="h-full w-full object-cover"
                draggable={item.visibility === "public"}
                onDragStart={(event) => setImageDragData(event, item)}
                src={item.preview}
              />
              <button
                aria-label={labels.deleteImage ?? "Remove image"}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-surface/90 text-error opacity-0 shadow-sm transition-opacity hover:bg-error/10 focus:opacity-100 group-hover:opacity-100"
                onClick={() => removeImage(index)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 p-2">
              <input name="image_visibility" type="hidden" value={item.visibility} />
              <input name="image_token" type="hidden" value={item.token} />
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border-subtle bg-surface">
                <button
                  className={cn(
                    "px-2 py-1 text-[11px] transition-colors",
                    item.visibility === "public"
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-primary",
                  )}
                  onClick={() => updateVisibility(index, "public")}
                  type="button"
                >
                  {labels.imagePublic}
                </button>
                <button
                  className={cn(
                    "border-l border-border-subtle px-2 py-1 text-[11px] transition-colors",
                    item.visibility === "private"
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-primary",
                  )}
                  onClick={() => updateVisibility(index, "private")}
                  type="button"
                >
                  {labels.imagePrivate}
                </button>
              </div>
              {item.visibility === "public" ? (
                <button
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-[11px] font-medium text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
                  onClick={() => insertImage(item)}
                  type="button"
                >
                  <TextCursorInput className="h-3.5 w-3.5" />
                  {labels.insertImage}
                </button>
              ) : (
                <p className="text-[11px] leading-4 text-muted">{labels.privateImageInsertHint}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">{labels.imagesNote}</p>
      {pickerInput}
      {submitInput}
    </div>
  );
}
