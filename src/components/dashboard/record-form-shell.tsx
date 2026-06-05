"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleHelp } from "lucide-react";
import { createRecordAction } from "@/app/dashboard-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AmountVisibilityField } from "./amount-visibility-field";
import type { EditorMode } from "@/lib/types";
import { MarkdownTextarea, type MarkdownTextareaHandle } from "./markdown-textarea";
import { RecordImagePicker } from "./record-image-picker";

function localDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type RecordDraft = {
  amount: string;
  content: string;
  currency: string;
  date: string;
  editorMode: EditorMode;
  isAnonymous: boolean;
  isPublic: boolean;
  showAmount: string;
  title: string;
  type: "donation" | "kindness" | "open_source";
  updatedAt: number;
};

function readFormDraft(form: HTMLFormElement, editorMode: EditorMode): RecordDraft {
  const formData = new FormData(form);

  return {
    amount: String(formData.get("amount") ?? ""),
    content: String(formData.get("content") ?? ""),
    currency: String(formData.get("currency") ?? "USD"),
    date: String(formData.get("date") ?? ""),
    editorMode,
    isAnonymous: formData.has("is_anonymous"),
    isPublic: formData.has("is_public"),
    showAmount: String(formData.get("show_amount") ?? "1"),
    title: String(formData.get("title") ?? ""),
    type: (String(formData.get("type") ?? "donation") as RecordDraft["type"]),
    updatedAt: Date.now(),
  };
}

function hasDraftContent(draft: RecordDraft) {
  return Boolean(draft.title.trim() || draft.content.trim() || draft.amount.trim());
}

function SubmitRecordButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {label}
    </Button>
  );
}

export function RecordFormShell({
  locale,
  title,
  note,
  labels,
  defaultEditorMode = "markdown",
  userId,
}: {
  locale: string;
  title: string;
  note: string;
  defaultEditorMode?: EditorMode;
  userId?: string;
  labels: {
    recordSection: string;
    storySection: string;
    imagesSection: string;
    typeDonation: string;
    typeKindness: string;
    typeOpenSource: string;
    fieldTitle: string;
    fieldDate: string;
    fieldDateHelp: string;
    fieldDescription: string;
    fieldDescriptionHelp: string;
    fieldImages: string;
    imagesNote: string;
    imagesSelected: string;
    imagesRemaining: string;
    imagePublic: string;
    imagePrivate: string;
    insertImage: string;
    imageMarkdownAlt: string;
    privateImageInsertHint: string;
    imageTooLarge: string;
    imageTypeUnsupported: string;
    addImages: string;
    fieldCategory: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    visibilityPublic: string;
    hideAmount: string;
    anonymous: string;
    saveDraft: string;
    amount: string;
    currency: string;
    amountPlaceholder: string;
    amountVisible: string;
    amountHidden: string;
    markdownWrite: string;
    markdownPreview: string;
    markdownEmptyPreview: string;
    markdownOn: string;
    markdownOff: string;
  };
}) {
  const draftKey = useMemo(
    () => `curvio:new-record-draft:${locale}:${userId ?? "anonymous"}`,
    [locale, userId],
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const markdownRef = useRef<MarkdownTextareaHandle | null>(null);
  const [state, formAction] = useActionState(createRecordAction, {
    status: "idle",
  });
  const [initialDraft, setInitialDraft] = useState<RecordDraft | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>(defaultEditorMode);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  const initialDate = initialDraft?.date || localDateInputValue();

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(`${draftKey}:submitted`) === "1") {
        window.localStorage.removeItem(draftKey);
        window.sessionStorage.removeItem(`${draftKey}:submitted`);
        return;
      }

      const storedDraft = window.localStorage.getItem(draftKey);
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft) as Partial<RecordDraft>;
        if (parsed && typeof parsed === "object") {
          const restoredDraft: RecordDraft = {
            amount: typeof parsed.amount === "string" ? parsed.amount : "",
            content: typeof parsed.content === "string" ? parsed.content : "",
            currency: typeof parsed.currency === "string" ? parsed.currency : "USD",
            date: typeof parsed.date === "string" ? parsed.date : "",
            editorMode: parsed.editorMode === "plain" ? "plain" : "markdown",
            isAnonymous: Boolean(parsed.isAnonymous),
            isPublic: parsed.isPublic !== false,
            showAmount: parsed.showAmount === "0" ? "0" : "1",
            title: typeof parsed.title === "string" ? parsed.title : "",
            type:
              parsed.type === "kindness" || parsed.type === "open_source"
                ? parsed.type
                : "donation",
            updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
          };
          window.setTimeout(() => {
            setInitialDraft(restoredDraft);
            setEditorMode(restoredDraft.editorMode);
          }, 0);
        }
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    } finally {
      setDraftLoaded(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (state?.status === "error") {
      window.sessionStorage.removeItem(`${draftKey}:submitted`);
    }
  }, [draftKey, state?.status]);

  const saveDraft = useCallback(() => {
    const form = formRef.current;
    if (!form || !draftLoaded) {
      return;
    }

    const draft = readFormDraft(form, editorMode);
    if (!hasDraftContent(draft)) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    window.localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draftKey, draftLoaded, editorMode]);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    const intervalId = window.setInterval(saveDraft, 800);
    window.addEventListener("pagehide", saveDraft);
    window.addEventListener("beforeunload", saveDraft);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", saveDraft);
      window.removeEventListener("beforeunload", saveDraft);
    };
  }, [draftLoaded, saveDraft]);

  function insertImage(token: string) {
    setEditorMode("markdown");
    markdownRef.current?.insertMarkdown(`\n\n![${labels.imageMarkdownAlt}](curvio-image:${token})\n\n`);
  }

  return (
    <Card className="space-y-6">
      <form
        action={formAction}
        className="space-y-6"
        key={draftLoaded ? `loaded-${initialDraft?.updatedAt ?? "empty"}` : "loading"}
        onChange={saveDraft}
        onInput={saveDraft}
        onSubmit={() => window.sessionStorage.setItem(`${draftKey}:submitted`, "1")}
        ref={formRef}
      >
        <input name="locale" type="hidden" value={locale} />
        <div>
          <h2 className="text-2xl font-medium">{title}</h2>
          {note ? <p className="mt-2 text-sm leading-6 text-muted">{note}</p> : null}
        </div>
        {state?.status === "error" && state.message ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {state.message}
          </div>
        ) : null}
        <section className="space-y-4 border-t border-border-subtle pt-6">
          <h3 className="text-lg font-medium">{labels.recordSection}</h3>
          <div className="space-y-2">
            <p className="text-sm font-medium">{labels.fieldCategory}</p>
            <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer">
              <input
                defaultChecked={(initialDraft?.type ?? "donation") === "donation"}
                className="peer sr-only"
                name="type"
                type="radio"
                value="donation"
              />
              <Badge className="px-4 py-2 text-sm border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
                {labels.typeDonation}
              </Badge>
            </label>
            <label className="cursor-pointer">
              <input
                defaultChecked={initialDraft?.type === "kindness"}
                className="peer sr-only"
                name="type"
                type="radio"
                value="kindness"
              />
              <Badge className="px-4 py-2 text-sm border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
                {labels.typeKindness}
              </Badge>
            </label>
            <label className="cursor-pointer">
              <input
                defaultChecked={initialDraft?.type === "open_source"}
                className="peer sr-only"
                name="type"
                type="radio"
                value="open_source"
              />
              <Badge className="px-4 py-2 text-sm border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
                {labels.typeOpenSource}
              </Badge>
            </label>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              {labels.fieldTitle}
              <Input
                defaultValue={initialDraft?.title ?? ""}
                name="title"
                placeholder={labels.titlePlaceholder}
                required
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                {labels.fieldDate}
                <span className="group relative inline-flex">
                  <CircleHelp
                    aria-label={labels.fieldDateHelp}
                    className="h-3.5 w-3.5 text-muted"
                  />
                  <span className="pointer-events-none absolute left-1/2 top-6 z-10 hidden w-64 -translate-x-1/2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs font-normal leading-5 text-muted shadow-sm group-hover:block">
                    {labels.fieldDateHelp}
                  </span>
                </span>
              </span>
              <Input
                aria-label={labels.fieldDate}
                defaultValue={initialDate}
                name="date"
                required
                type="date"
              />
            </label>
          </div>
          <AmountVisibilityField
            defaultAmount={initialDraft?.amount ?? ""}
            defaultCurrency={initialDraft?.currency ?? "USD"}
            defaultHidden={initialDraft?.showAmount === "0"}
            labels={labels}
          />
        </section>

        <section className="space-y-4 border-t border-border-subtle pt-6">
          <h3 className="text-lg font-medium">{labels.storySection}</h3>
          <div className="space-y-2 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <p>{labels.fieldDescription}</p>
              <span className="group relative inline-flex">
                <button
                  aria-label={labels.fieldDescriptionHelp}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
                  type="button"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                </button>
                <span className="absolute left-6 top-0 z-10 hidden w-72 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs font-normal leading-5 text-muted shadow-sm group-hover:block group-focus-within:block">
                  <span className="block">{labels.fieldDescriptionHelp}</span>
                  <button
                    className="mt-2 rounded-md border border-border-subtle bg-surface-offwhite px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
                    onClick={() => setEditorMode(editorMode === "markdown" ? "plain" : "markdown")}
                    type="button"
                  >
                    {editorMode === "markdown" ? labels.markdownOff : labels.markdownOn}
                  </button>
                </span>
              </span>
            </div>
            <MarkdownTextarea
              editorMode={editorMode}
              defaultValue={initialDraft?.content ?? ""}
              imagePreviewUrls={imagePreviewUrls}
              labels={{
                markdownEmptyPreview: labels.markdownEmptyPreview,
                markdownPreview: labels.markdownPreview,
                markdownWrite: labels.markdownWrite,
              }}
              name="content"
              onValueChange={saveDraft}
              placeholder={labels.descriptionPlaceholder}
              ref={markdownRef}
              required
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-border-subtle pt-6">
          <h3 className="text-lg font-medium">{labels.imagesSection}</h3>
          <RecordImagePicker
            existingCount={0}
            labels={{
              addImages: labels.addImages,
              imagesNote: labels.imagesNote,
              imagesRemaining: labels.imagesRemaining,
              imagesSelected: labels.imagesSelected,
              imagePrivate: labels.imagePrivate,
              imagePublic: labels.imagePublic,
              insertImage: labels.insertImage,
              privateImageInsertHint: labels.privateImageInsertHint,
              imageTooLarge: labels.imageTooLarge,
              imageTypeUnsupported: labels.imageTypeUnsupported,
            }}
            name="images"
            onInsertImage={insertImage}
            onPreviewUrlsChange={setImagePreviewUrls}
          />
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
            {labels.visibilityPublic}
            <input
              className="h-5 w-5 rounded-lg border border-border-subtle accent-primary"
              defaultChecked={initialDraft?.isPublic ?? true}
              name="is_public"
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
            {labels.anonymous}
            <input
              className="h-5 w-5 rounded-lg border border-border-subtle accent-primary"
              defaultChecked={initialDraft?.isAnonymous ?? false}
              name="is_anonymous"
              type="checkbox"
            />
          </label>
        </div>
        <SubmitRecordButton label={labels.saveDraft} />
      </form>
    </Card>
  );
}
