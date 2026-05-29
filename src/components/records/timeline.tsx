import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { recordTypeToSegment } from "@/lib/record-types";
import type { GoodwillRecord } from "@/lib/types";
import { RecordIcon } from "./record-icon";
import { recordLabel } from "./record-label";
import Link from "next/link";

export function Timeline({
  records,
  locale,
  hiddenAmountLabel,
  typeLabels,
  showAuthor = false,
  byLabel = "by",
  anonymousLabel = "Anonymous",
}: {
  records: GoodwillRecord[];
  locale: Locale;
  hiddenAmountLabel: string;
  typeLabels?: Partial<Record<GoodwillRecord["type"], string>>;
  showAuthor?: boolean;
  byLabel?: string;
  anonymousLabel?: string;
}) {
  return (
    <div className="relative ml-3 border-l border-border-subtle pl-8">
      <div className="space-y-8">
        {records.map((record) => (
          <article className="relative" key={record.id}>
            <div className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border border-outline bg-background ring-4 ring-background" />
            <time className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
              {new Intl.DateTimeFormat(locale, {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date(record.date))}
            </time>
            <Card className="hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  {record.isAnonymous ? (
                    <h3 className="text-xl font-medium">{record.title}</h3>
                  ) : (
                    <Link
                      className="text-xl font-medium transition-colors hover:text-primary"
                      href={localizePath(
                        locale,
                        `/u/${record.authorUsername}/${recordTypeToSegment(record.type)}/${record.id}`,
                      )}
                    >
                      {record.title}
                    </Link>
                  )}
                  {showAuthor ? (
                    <p className="mt-2 text-xs text-muted">
                      {byLabel}{" "}
                      {record.isAnonymous ? anonymousLabel : record.authorDisplayName}
                    </p>
                  ) : null}
                </div>
                <Badge>
                  <RecordIcon className="h-3.5 w-3.5" type={record.type} />
                  {typeLabels?.[record.type] ?? recordLabel(record.type)}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">
                {record.content}
              </p>
              {record.amountHidden ? (
                <p className="mt-4 text-sm italic text-muted">{hiddenAmountLabel}</p>
              ) : null}
            </Card>
          </article>
        ))}
      </div>
    </div>
  );
}
