"use client";

import { useActionState } from "react";
import { createRecordAction } from "@/app/dashboard-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { AmountVisibilityField } from "./amount-visibility-field";
import { RecordImagePicker } from "./record-image-picker";

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
    imagesSelected: string;
    imagesRemaining: string;
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
  };
}) {
  const [state, formAction] = useActionState(createRecordAction, {
    status: "idle",
  });

  return (
    <Card className="space-y-6">
      <form action={formAction} className="space-y-6">
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
        <div className="space-y-2">
          <p className="text-sm font-medium">{labels.fieldCategory}</p>
          <div className="flex flex-wrap gap-3">
          <label className="cursor-pointer">
            <input defaultChecked className="peer sr-only" name="type" type="radio" value="donation" />
            <Badge className="px-4 py-2 text-sm border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
              {labels.typeDonation}
            </Badge>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="type" type="radio" value="kindness" />
            <Badge className="px-4 py-2 text-sm border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
              {labels.typeKindness}
            </Badge>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="type" type="radio" value="open_source" />
            <Badge className="px-4 py-2 text-sm border border-transparent peer-checked:border-primary/30 peer-checked:bg-primary/10 peer-checked:text-primary">
              {labels.typeOpenSource}
            </Badge>
          </label>
          </div>
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
        <div className="space-y-2">
          <p className="text-sm font-medium">{labels.fieldImages}</p>
          <RecordImagePicker
            existingCount={0}
            labels={{
              addImages: labels.addImages,
              imagesNote: labels.imagesNote,
              imagesRemaining: labels.imagesRemaining,
              imagesSelected: labels.imagesSelected,
            }}
            name="images"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
            {labels.visibilityPublic}
            <input defaultChecked className="h-5 w-5 rounded-lg border border-border-subtle accent-primary" name="is_public" type="checkbox" />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
            {labels.anonymous}
            <input className="h-5 w-5 rounded-lg border border-border-subtle accent-primary" name="is_anonymous" type="checkbox" />
          </label>
        </div>
        <Button type="submit">{labels.saveDraft}</Button>
      </form>
    </Card>
  );
}
