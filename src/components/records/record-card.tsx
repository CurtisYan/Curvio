import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { markdownToPlainText } from "@/lib/markdown";
import { recordTypeToSegment } from "@/lib/record-types";
import { formatRecordPublicId } from "@/lib/record-public-id";
import type { GoodwillRecord } from "@/lib/types";
import { RecordIcon } from "./record-icon";
import { recordLabel } from "./record-label";

export function RecordCard({
  record,
  locale,
  anonymousLabel,
  typeLabels,
}: {
  record: GoodwillRecord;
  locale: Locale;
  anonymousLabel: string;
  typeLabels?: Partial<Record<GoodwillRecord["type"], string>>;
}) {
  const author = record.isAnonymous ? anonymousLabel : record.authorDisplayName;
  const typeLabel = typeLabels?.[record.type] ?? recordLabel(record.type);
  const contentSummary = markdownToPlainText(record.content);
  const publicRecordId = formatRecordPublicId(record.date, record.id);
  const detailHref = localizePath(
    locale,
    `/u/${record.authorUsername}/${recordTypeToSegment(record.type)}/${publicRecordId}`,
  );
  const typeHref = localizePath(locale, `/explore?type=${record.type}`);
  const images = (record.images ?? []).slice().sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return 0;
  });
  const visibleImages = images.slice(0, 4);
  const extraImageCount = Math.max(images.length - visibleImages.length, 0);

  return (
    <Card className="flex min-h-[260px] flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
          <RecordIcon className="h-4 w-4 text-primary" type={record.type} />
          <Link className="transition-colors hover:text-primary" href={typeHref}>
            {typeLabel}
          </Link>
        </div>
        <time className="text-sm text-muted">
          {new Intl.DateTimeFormat(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(record.date))}
        </time>
      </div>
      {record.isAnonymous ? (
        <h3 className="text-2xl font-medium leading-tight text-foreground">
          {record.title}
        </h3>
      ) : (
        <Link
          className="text-2xl font-medium leading-tight text-foreground transition-colors hover:text-primary"
          href={detailHref}
        >
          {record.title}
        </Link>
      )}
      <p className="text-sm leading-6 text-on-surface-variant">{contentSummary}</p>
      {visibleImages.length > 0 ? (
        <div className="flex gap-2">
          {visibleImages.map((image, index) => {
            const isLastWithMore = index === visibleImages.length - 1 && extraImageCount > 0;

            return (
              <div
                className="relative h-14 w-14 overflow-hidden rounded-lg border border-border-subtle bg-surface-container-low"
                key={image.id}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={image.url}
                />
                {isLastWithMore ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white">
                    +{extraImageCount}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
      <div className="mt-auto space-y-3 pt-3">
        {record.isAnonymous ? (
          <p className="text-sm text-muted">by {author}</p>
        ) : (
          <Link
            className="text-sm text-muted transition-colors hover:text-primary"
            href={localizePath(locale, `/u/${record.authorUsername}`)}
          >
            by {author}
          </Link>
        )}
        <div className="flex flex-wrap gap-2">
          {record.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
