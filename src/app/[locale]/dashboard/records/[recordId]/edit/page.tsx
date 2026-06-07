import { redirect } from "next/navigation";
import { updateRecordAction } from "@/app/dashboard-actions";
import {
  deleteRecordImageAction,
  moveRecordImageAction,
  setCoverImageAction,
  updateRecordImageVisibilityAction,
  uploadRecordImagesAction,
} from "@/app/record-images-actions";
import { AmountVisibilityField } from "@/components/dashboard/amount-visibility-field";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MarkdownTextarea } from "@/components/dashboard/markdown-textarea";
import { RecordImagePicker } from "@/components/dashboard/record-image-picker";
import { CleanUrlOnMount } from "@/components/site/clean-url-on-mount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { resolveRecordId } from "@/lib/record-public-id";
import { createClient } from "@/utils/supabase/server";

export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; recordId: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const { locale: rawLocale, recordId } = await params;
  const { status, message } = await searchParams;
  const dbRecordId = resolveRecordId(recordId);

  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: record } = await supabase
    .from("records")
    .select("*")
    .eq("id", dbRecordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!record) {
    redirect(`/${locale}/dashboard/records`);
  }

  const { data: images } = await supabase
    .from("record_images")
    .select("id, r2_url, sort_order, is_cover, visibility")
    .eq("record_id", record.id)
    .order("sort_order", { ascending: true });

  const typeLabels = {
    donation: messages.common.recordDonation,
    kindness: messages.common.recordKindness,
    open_source: messages.common.recordOpenWork,
  };

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      {status ? <CleanUrlOnMount /> : null}
      <DashboardNav locale={locale} labels={messages.dashboard} />

      <Card className="mt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{messages.dashboard.editTitle}</h1>
          <p className="mt-2 text-sm text-muted">{messages.dashboard.editLead}</p>
        </div>
        {status === "saved" ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {messages.dashboard.editSaved}
          </div>
        ) : null}
        {status === "error" ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {message || messages.dashboard.editError}
          </div>
        ) : null}
        <form action={updateRecordAction} className="space-y-6">
          <input name="locale" type="hidden" value={locale} />
          <input name="record_id" type="hidden" value={record.id} />
          <div className="flex flex-wrap gap-2">
            <Badge>{typeLabels[record.type as keyof typeof typeLabels]}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              {messages.dashboard.fieldTitle}
              <Input defaultValue={record.title} name="title" required />
            </label>
            <label className="space-y-2 text-sm font-medium">
              {messages.dashboard.fieldDate}
              <Input defaultValue={record.date} name="date" required type="date" />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium">
            {messages.dashboard.fieldDescription}
            <MarkdownTextarea
              defaultValue={record.content}
              editorMode="markdown"
              labels={{
                markdownEmptyPreview: messages.dashboard.markdownEmptyPreview,
                markdownPreview: messages.dashboard.markdownPreview,
                markdownWrite: messages.dashboard.markdownWrite,
              }}
              name="content"
              placeholder={messages.dashboard.descriptionPlaceholder}
              required
            />
          </label>
          <AmountVisibilityField
            labels={messages.dashboard}
            defaultAmount={record.amount ? String(record.amount) : ""}
            defaultCurrency={record.currency ?? "USD"}
            defaultHidden={Boolean(record.amount) && !record.show_amount}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
              {messages.dashboard.visibilityPublic}
              <input
                className="h-5 w-5 rounded-lg border border-border-subtle accent-primary"
                defaultChecked={record.is_public}
                name="is_public"
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
              {messages.dashboard.anonymous}
              <input
                className="h-5 w-5 rounded-lg border border-border-subtle accent-primary"
                defaultChecked={record.is_anonymous}
                name="is_anonymous"
                type="checkbox"
              />
            </label>
          </div>
          <Button type="submit">{messages.dashboard.saveChanges}</Button>
        </form>
      </Card>

      <Card className="mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-medium">{messages.dashboard.imagesTitle}</h2>
          <p className="mt-2 text-sm text-muted">{messages.dashboard.imagesLead}</p>
        </div>

        <form action={uploadRecordImagesAction} className="space-y-3">
          <input name="locale" type="hidden" value={locale} />
          <input name="record_id" type="hidden" value={record.id} />
          <input name="record_type" type="hidden" value={record.type} />
          <input name="content" type="hidden" value={record.content} />
          <RecordImagePicker
            existingCount={images?.length ?? 0}
            labels={{
              addImages: messages.dashboard.addImages,
              imagesNote: messages.dashboard.imagesNote,
              imagesRemaining: messages.dashboard.imagesRemaining,
              imagesSelected: messages.dashboard.imagesSelected,
              imagePrivate: messages.dashboard.imagePrivate,
              imagePublic: messages.dashboard.imagePublic,
              insertImage: messages.dashboard.insertImage,
              imageMarkdownAlt: messages.dashboard.imageMarkdownAlt,
              deleteImage: messages.dashboard.deleteImage,
              privateImageInsertHint: messages.dashboard.privateImageInsertHint,
              imageTooLarge: messages.dashboard.imageTooLarge,
              imageTypeUnsupported: messages.dashboard.imageTypeUnsupported,
            }}
            name="images"
          />
          <Button type="submit" variant="secondary">
            {messages.dashboard.saveSelectedImages}
          </Button>
        </form>

        {images && images.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div
                className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-container-low"
                key={image.id}
              >
                <div className="aspect-square">
                  <img
                    alt={record.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    src={image.r2_url}
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>#{image.sort_order}</span>
                    {image.is_cover ? (
                      <Badge className="border border-primary/20 bg-primary/10 text-primary">
                        {messages.dashboard.coverLabel}
                      </Badge>
                    ) : null}
                    <Badge>
                      {image.visibility === "private"
                        ? messages.dashboard.imagePrivate
                        : messages.dashboard.imagePublic}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={moveRecordImageAction}>
                      <input name="locale" type="hidden" value={locale} />
                      <input name="record_id" type="hidden" value={record.id} />
                      <input name="image_id" type="hidden" value={image.id} />
                      <input name="direction" type="hidden" value="up" />
                      <Button disabled={index === 0} type="submit" variant="ghost">
                        {messages.dashboard.moveUp}
                      </Button>
                    </form>
                    <form action={moveRecordImageAction}>
                      <input name="locale" type="hidden" value={locale} />
                      <input name="record_id" type="hidden" value={record.id} />
                      <input name="image_id" type="hidden" value={image.id} />
                      <input name="direction" type="hidden" value="down" />
                      <Button
                        disabled={index === images.length - 1}
                        type="submit"
                        variant="ghost"
                      >
                        {messages.dashboard.moveDown}
                      </Button>
                    </form>
                    {!image.is_cover ? (
                      <form action={setCoverImageAction}>
                        <input name="locale" type="hidden" value={locale} />
                        <input name="record_id" type="hidden" value={record.id} />
                        <input name="image_id" type="hidden" value={image.id} />
                        <Button type="submit" variant="secondary">
                          {messages.dashboard.setCover}
                        </Button>
                      </form>
                    ) : null}
                    <form action={updateRecordImageVisibilityAction}>
                      <input name="locale" type="hidden" value={locale} />
                      <input name="record_id" type="hidden" value={record.id} />
                      <input name="image_id" type="hidden" value={image.id} />
                      <input
                        name="visibility"
                        type="hidden"
                        value="public"
                      />
                      <Button
                        disabled={image.visibility !== "private"}
                        type="submit"
                        variant="secondary"
                      >
                        {messages.dashboard.imagePublic}
                      </Button>
                    </form>
                    <form action={updateRecordImageVisibilityAction}>
                      <input name="locale" type="hidden" value={locale} />
                      <input name="record_id" type="hidden" value={record.id} />
                      <input name="image_id" type="hidden" value={image.id} />
                      <input
                        name="visibility"
                        type="hidden"
                        value="private"
                      />
                      <Button
                        disabled={image.visibility === "private"}
                        type="submit"
                        variant="secondary"
                      >
                        {messages.dashboard.imagePrivate}
                      </Button>
                    </form>
                    <form action={deleteRecordImageAction}>
                      <input name="locale" type="hidden" value={locale} />
                      <input name="record_id" type="hidden" value={record.id} />
                      <input name="image_id" type="hidden" value={image.id} />
                      <Button type="submit" variant="ghost">
                        {messages.dashboard.deleteImage}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border-subtle bg-surface-container-low px-4 py-4 text-sm text-muted">
            {messages.dashboard.imagesEmpty}
          </div>
        )}
      </Card>
    </main>
  );
}
