"use client";

import dynamic from "next/dynamic";
import type { ImagePreviewHandler, MDXEditorMethods, ViewMode } from "@mdxeditor/editor";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { EditorMode } from "@/lib/types";

const RecordMarkdownEditorCore = dynamic(
  () =>
    import("./record-markdown-editor-core").then(
      (module) => module.RecordMarkdownEditorCore,
    ),
  {
    loading: () => (
      <div aria-busy className="min-h-40 rounded-lg border border-border-subtle bg-surface-offwhite" />
    ),
    ssr: false,
  },
);

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
      uploadImage?: string;
    };
    name: string;
    locale?: "en" | "zh";
    placeholder: string;
    imagePreviewUrls?: Record<string, string>;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    required?: boolean;
  }
>(function MarkdownTextarea(
  { defaultValue = "", editorMode, imagePreviewUrls, labels, locale = "en", name, onValueChange, placeholder },
  ref,
) {
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const mountedRef = useRef(false);
  const [value, setValue] = useState(defaultValue);
  const [localImagePreviewUrls, setLocalImagePreviewUrls] = useState<Record<string, string>>({});
  const mergedImagePreviewUrls = useMemo(
    () => ({ ...imagePreviewUrls, ...localImagePreviewUrls }),
    [imagePreviewUrls, localImagePreviewUrls],
  );
  const previewUrlsRef = useRef(mergedImagePreviewUrls);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    previewUrlsRef.current = mergedImagePreviewUrls;
  }, [mergedImagePreviewUrls]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const updateValue = useCallback((nextValue: string) => {
    if (!mountedRef.current) {
      return;
    }

    setValue(nextValue);
    onValueChange?.(nextValue);
  }, [onValueChange]);

  const insertMarkdownAtCursor = useCallback(
    (text: string) => {
      const editor = editorRef.current;

      if (editor) {
        editor.focus(() => editor.insertMarkdown(text), { defaultSelection: "rootEnd" });
        return;
      }

      updateValue(`${value}${text}`);
    },
    [updateValue, value],
  );

  useEffect(() => {
    function onInsertMarkdown(event: Event) {
      const customEvent = event as CustomEvent<{
        markdown?: string;
        previewUrl?: string;
        token?: string;
      }>;
      const markdown = customEvent.detail?.markdown;
      const previewUrl = customEvent.detail?.previewUrl;
      const token = customEvent.detail?.token;

      if (token && previewUrl) {
        setLocalImagePreviewUrls((current) => ({ ...current, [token]: previewUrl }));
      }

      if (typeof markdown === "string" && markdown) {
        insertMarkdownAtCursor(markdown);
      }
    }

    window.addEventListener("curvio:insert-markdown", onInsertMarkdown);

    return () => {
      window.removeEventListener("curvio:insert-markdown", onInsertMarkdown);
    };
  }, [insertMarkdownAtCursor]);

  useImperativeHandle(ref, () => ({
    insertMarkdown(text: string) {
      insertMarkdownAtCursor(text);
    },
  }));

  const initialViewMode: ViewMode = editorMode === "plain" ? "source" : "rich-text";
  const imagePreviewHandler = useCallback<NonNullable<ImagePreviewHandler>>(async (source) => {
    const token = source.match(/^curvio-image:([a-zA-Z0-9_-]+)$/)?.[1];

    if (token) {
      return previewUrlsRef.current[token] ?? source;
    }

    return source;
  }, []);

  return (
    <div className="space-y-2">
      <input name={name} type="hidden" value={value} />
      <RecordMarkdownEditorCore
        editorRef={editorRef}
        imagePreviewHandler={imagePreviewHandler}
        initialViewMode={initialViewMode}
        locale={locale}
        markdown={value}
        onChange={updateValue}
        placeholder={placeholder}
        uploadImageLabel={labels.uploadImage ?? "Upload image"}
      />
    </div>
  );
});
