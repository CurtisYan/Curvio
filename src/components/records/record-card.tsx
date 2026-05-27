import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
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

  return (
    <Card className="flex min-h-[260px] flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
          <RecordIcon className="h-4 w-4 text-primary" type={record.type} />
          <span>{typeLabel}</span>
        </div>
        <time className="text-sm text-muted">
          {new Intl.DateTimeFormat(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(record.date))}
        </time>
      </div>
      <h3 className="text-2xl font-medium leading-tight text-foreground">
        {record.title}
      </h3>
      <p className="text-sm leading-6 text-on-surface-variant">{record.content}</p>
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
