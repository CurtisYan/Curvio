import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordIcon } from "@/components/records/record-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";
import { segmentToRecordType } from "@/lib/record-types";
import { createClient } from "@/utils/supabase/server";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ locale: string; username: string; recordType: string; recordId: string }>;
}) {
  const { locale: rawLocale, username, recordType, recordId } = await params;

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
  const { data: record } = await supabase
    .from("records")
    .select("*")
    .eq("id", recordId)
    .maybeSingle();

  if (!record || record.type !== type) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", record.user_id)
    .maybeSingle();

  if (!profile || profile.username !== username) {
    notFound();
  }

  const { data: images } = await supabase
    .from("record_images")
    .select("id, r2_url, sort_order, is_cover")
    .eq("record_id", record.id)
    .order("sort_order", { ascending: true });

  const typeLabels = {
    donation: messages.common.recordDonation,
    kindness: messages.common.recordKindness,
    open_source: messages.common.recordOpenWork,
  };

  const authorName = record.is_anonymous
    ? messages.common.anonymous
    : profile.display_name;

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <div className="mb-8">
        <Link
          className="text-sm text-muted transition-colors hover:text-primary"
          href={localizePath(locale, `/u/${username}`)}
        >
          {messages.common.brand}
        </Link>
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

        <p className="text-base leading-7 text-on-surface-variant">{record.content}</p>

        {record.reflection ? (
          <p className="rounded-lg border border-border-subtle bg-surface-container-low px-4 py-3 text-sm italic text-muted">
            {record.reflection}
          </p>
        ) : null}

        {record.show_amount && record.amount ? (
          <div className="text-sm text-muted">
            {record.amount} {record.currency ?? ""}
          </div>
        ) : record.amount ? (
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

      {images && images.length > 0 ? (
        <section className="mt-10">
          {(() => {
            const cover = images.find((image) => image.is_cover);
            return cover ? (
            <div className="mb-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface-container-low">
              <img
                alt={record.title}
                className="h-full w-full object-cover"
                loading="lazy"
                src={cover.r2_url}
              />
            </div>
            ) : null;
          })()}
          <div className="grid gap-4 md:grid-cols-2">
            {images
              .filter((image) => !image.is_cover)
              .map((image) => (
                <div
                  className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container-low"
                  key={image.id}
                >
                  <img
                    alt={record.title}
                    className="h-full w-full object-cover"
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
