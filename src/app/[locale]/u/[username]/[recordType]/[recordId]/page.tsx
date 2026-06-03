import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { archiveRecordAction, deleteRecordAction, restoreRecordAction } from "@/app/dashboard-actions";
import { RecordIcon } from "@/components/records/record-icon";
import { RecordMarkdown } from "@/components/records/record-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";
import { formatRecordPublicId, resolveRecordId } from "@/lib/record-public-id";
import { segmentToRecordType } from "@/lib/record-types";
import { createClient } from "@/utils/supabase/server";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ locale: string; username: string; recordType: string; recordId: string }>;
}) {
  const { locale: rawLocale, username, recordType, recordId } = await params;

  const dbRecordId = resolveRecordId(recordId);

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const messages = getDictionary(locale);
  const type = segmentToRecordType(recordType);

  if (!type) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: ownerRecord } = user
    ? await supabase
        .from("records")
        .select("*")
        .eq("id", dbRecordId)
        .maybeSingle()
    : { data: null };

  const isOwner = Boolean(ownerRecord && user?.id === ownerRecord.user_id);
  const { data: publicRecord } = !isOwner
    ? await supabase
        .from("public_records")
        .select("*")
        .eq("id", dbRecordId)
        .eq("username", username)
        .maybeSingle()
    : { data: null };

  const record = ownerRecord ?? publicRecord;

  if (!record || record.type !== type) {
    notFound();
  }

  const profile = isOwner
    ? (await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", record.user_id)
        .maybeSingle()).data
    : {
        username: "username" in record ? record.username : username,
        display_name: "display_name" in record ? record.display_name : username,
        avatar_url: "avatar_url" in record ? record.avatar_url : null,
      };

  if (!profile || profile.username !== username) {
    notFound();
  }

  const { data: images } = await supabase
    .from("record_images")
    .select("id, r2_url, sort_order, is_cover")
    .eq("record_id", record.id)
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });
  const galleryImages = (images ?? []).filter((image) => !record.content.includes(image.r2_url));

  const typeLabels = {
    donation: messages.common.recordDonation,
    kindness: messages.common.recordKindness,
    open_source: messages.common.recordOpenWork,
  };

  const authorName = record.is_anonymous
    ? messages.common.anonymous
    : profile.display_name;
  const authorInitial =
    String(authorName)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "U";
  const publicRecordId = "public_record_id" in record && record.public_record_id
    ? record.public_record_id
    : formatRecordPublicId(record.date, record.id);
  const ownerReturnPath =
    record.type === "donation"
      ? "dashboard/donations"
      : record.type === "kindness"
        ? "dashboard/acts"
        : "dashboard/projects";

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          className="inline-flex items-center gap-3 rounded-full pr-3 text-sm text-muted transition-colors hover:text-primary"
          href={localizePath(locale, `/u/${username}`)}
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-low text-xs font-semibold text-primary">
            {!record.is_anonymous && profile.avatar_url ? (
              <img
                alt={profile.display_name}
                className="h-full w-full object-cover"
                loading="lazy"
                src={profile.avatar_url}
              />
            ) : (
              authorInitial
            )}
          </span>
          <span>
            <span className="block font-medium text-foreground">{authorName}</span>
            {!record.is_anonymous ? (
              <span className="block text-xs text-muted">@{profile.username}</span>
            ) : null}
          </span>
        </Link>

        {isOwner ? (
          <details className="relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-border-subtle bg-surface-offwhite px-3 text-sm text-muted transition-colors hover:bg-surface-container-low hover:text-primary marker:hidden">
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              {messages.dashboard.manageRecord}
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border-subtle bg-surface-offwhite p-2 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <Link
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
                href={localizePath(locale, `/dashboard/records/${publicRecordId}/edit`)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {messages.dashboard.editRecord}
              </Link>
              {"archived_at" in record && record.archived_at ? (
                <form action={restoreRecordAction}>
                  <input name="locale" type="hidden" value={locale} />
                  <input name="record_id" type="hidden" value={record.id} />
                  <input name="return_path" type="hidden" value={ownerReturnPath} />
                  <Button className="h-10 w-full justify-start border-transparent bg-transparent px-3 text-muted hover:text-primary" type="submit" variant="ghost">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    {messages.dashboard.restoreRecord}
                  </Button>
                </form>
              ) : (
                <form action={archiveRecordAction}>
                  <input name="locale" type="hidden" value={locale} />
                  <input name="record_id" type="hidden" value={record.id} />
                  <input name="return_path" type="hidden" value={ownerReturnPath} />
                  <Button className="h-10 w-full justify-start border-transparent bg-transparent px-3 text-muted hover:text-primary" type="submit" variant="ghost">
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    {messages.dashboard.archiveRecord}
                  </Button>
                </form>
              )}
              <details className="mt-1 border-t border-border-subtle pt-1">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-error/5 hover:text-error marker:hidden">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {messages.dashboard.deleteRecord}
                </summary>
                <form action={deleteRecordAction} className="mt-2 space-y-3 rounded-md border border-error/20 bg-error/5 p-3">
                  <input name="locale" type="hidden" value={locale} />
                  <input name="record_id" type="hidden" value={record.id} />
                  <input name="return_path" type="hidden" value={ownerReturnPath} />
                  <p className="text-xs leading-5 text-muted">{messages.dashboard.deleteRecordLead}</p>
                  <label className="flex items-start gap-2 text-xs leading-5 text-muted">
                    <input className="mt-0.5 h-4 w-4 accent-error" name="confirm_delete" required type="checkbox" value="1" />
                    {messages.dashboard.deleteRecordConfirm}
                  </label>
                  <Button className="h-10 w-full" type="submit" variant="danger">
                    {messages.dashboard.deleteRecordSubmit}
                  </Button>
                </form>
              </details>
            </div>
          </details>
        ) : null}
      </div>

      <Card className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link className="inline-flex" href={localizePath(locale, `/explore?type=${type}`)}>
            <Badge>
              <RecordIcon className="h-4 w-4" type={type} />
              {typeLabels[type]}
            </Badge>
          </Link>
          <span className="text-sm text-muted">
            {new Intl.DateTimeFormat(locale, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(new Date(record.date))}
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{record.title}</h1>
          <p className="mt-3 text-sm text-muted">
            {messages.common.by} {authorName}
          </p>
        </div>

        <RecordMarkdown>{record.content}</RecordMarkdown>

        {record.reflection ? (
          <p className="rounded-lg border border-border-subtle bg-surface-container-low px-4 py-3 text-sm italic text-muted">
            {record.reflection}
          </p>
        ) : null}

        {"show_amount" in record && record.show_amount && record.amount ? (
          <div className="text-sm text-muted">
            {record.amount} {record.currency ?? ""}
          </div>
        ) : (("amount" in record && record.amount) || ("amount_hidden" in record && record.amount_hidden)) ? (
          <div className="text-sm italic text-muted">{messages.common.hiddenAmount}</div>
        ) : null}

        {record.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {record.tags.map((tag: string) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}
      </Card>

      {galleryImages.length > 0 ? (
        <section className="mt-10">
          {(() => {
            const cover = galleryImages.find((image) => image.is_cover);
            return cover ? (
            <div className="mb-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface-container-low">
              <img
                alt={record.title}
                className="mx-auto max-h-[520px] w-auto max-w-full object-contain"
                loading="lazy"
                src={cover.r2_url}
              />
            </div>
            ) : null;
          })()}
          <div className="grid gap-4 md:grid-cols-2">
            {galleryImages
              .filter((image) => !image.is_cover)
              .map((image) => (
                <div
                  className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container-low"
                  key={image.id}
                >
                  <img
                    alt={record.title}
                    className="mx-auto max-h-80 w-auto max-w-full object-contain"
                    loading="lazy"
                    src={image.r2_url}
                  />
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
