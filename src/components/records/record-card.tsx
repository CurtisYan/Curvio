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
import { RecordImageStrip } from "./record-image-strip";
import { recordLabel } from "./record-label";

export function RecordCard({
  record,
  locale,
  anonymousLabel,
  hiddenAmountLabel,
  privateAmountLabel,
  typeLabels,
}: {
  record: GoodwillRecord;
  locale: Locale;
  anonymousLabel: string;
  hiddenAmountLabel?: string;
  privateAmountLabel?: string;
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
  const amountLabel = locale === "zh" ? "金额已隐藏" : "Hidden amount";
  const privateLabel = locale === "zh" ? "他人不可见" : "Hidden from others";
  const hasAmount = record.amount !== null && record.amount !== undefined;

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
      <RecordImageStrip images={record.images} size="lg" />
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
        {hasAmount ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              {record.amount} {record.currency ?? ""}
            </span>
            {record.amountHidden ? (
              <span className="rounded-full border border-border-subtle bg-surface-container-low px-2 py-0.5 text-xs">
                {privateAmountLabel ?? privateLabel}
              </span>
            ) : null}
          </div>
        ) : record.amountHidden ? (
          <p className="text-sm italic text-muted">{hiddenAmountLabel ?? amountLabel}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {record.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
