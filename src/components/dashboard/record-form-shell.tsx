"use client";

import { useFormState } from "react-dom";
import { createRecordAction } from "@/app/dashboard-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { AmountVisibilityField } from "./amount-visibility-field";

export function RecordFormShell({
  locale,
  title,
  note,
  labels,
}: {
  locale: string;
  title: string;
  note: string;
  labels: {
    typeDonation: string;
    typeKindness: string;
    typeOpenSource: string;
    fieldTitle: string;
    fieldDate: string;
    fieldDescription: string;
    fieldImages: string;
    imagesNote: string;
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
  };
}) {
  const [state, formAction] = useFormState(createRecordAction, {
    status: "idle",
  });

  return (
    <Card className="space-y-6">
      <form action={formAction} className="space-y-6" encType="multipart/form-data">
        <input name="locale" type="hidden" value={locale} />
        <div>
          <h2 className="text-2xl font-medium">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
        </div>
        {state?.status === "error" && state.message ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {state.message}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <input defaultChecked className="peer sr-only" name="type" type="radio" value="donation" />
            <Badge className="border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
              {labels.typeDonation}
            </Badge>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="type" type="radio" value="kindness" />
            <Badge className="border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
              {labels.typeKindness}
            </Badge>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="type" type="radio" value="open_source" />
            <Badge className="border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
              {labels.typeOpenSource}
            </Badge>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            {labels.fieldTitle}
            <Input name="title" placeholder={labels.titlePlaceholder} required />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {labels.fieldDate}
            <Input aria-label={labels.fieldDate} name="date" required type="date" />
          </label>
        </div>
        <label className="space-y-2 text-sm font-medium">
          {labels.fieldDescription}
          <Textarea name="content" placeholder={labels.descriptionPlaceholder} required />
        </label>
        <AmountVisibilityField labels={labels} />
        <label className="space-y-2 text-sm font-medium">
          {labels.fieldImages}
          <Input
            accept="image/png,image/jpeg,image/webp"
            multiple
            name="images"
            type="file"
          />
          <span className="block text-xs leading-5 text-muted">{labels.imagesNote}</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low p-3 text-sm">
            <input defaultChecked name="is_public" type="checkbox" />
            {labels.visibilityPublic}
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low p-3 text-sm">
            <input name="is_anonymous" type="checkbox" />
            {labels.anonymous}
          </label>
        </div>
        <Button type="submit">{labels.saveDraft}</Button>
      </form>
    </Card>
  );
}
