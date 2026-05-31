"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { recordTypeToSegment } from "@/lib/record-types";
import { formatRecordPublicId } from "@/lib/record-public-id";
import type { GoodwillRecord } from "@/lib/types";
import { RecordIcon } from "./record-icon";
import { recordLabel } from "./record-label";
import Link from "next/link";

function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

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
            <Card className="hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  {(() => {
                    const publicRecordId = formatRecordPublicId(record.date, record.id);
                    const detailHref = localizePath(
                      locale,
                      `/u/${record.authorUsername}/${recordTypeToSegment(record.type)}/${publicRecordId}`,
                    );
                    const typeHref = localizePath(locale, `/explore?type=${record.type}`);

                    return record.isAnonymous ? (
                      <h3 className="text-xl font-medium">{record.title}</h3>
                    ) : (
                      <Link
                        className="text-xl font-medium transition-colors hover:text-primary"
                        href={detailHref}
                      >
                        {record.title}
                      </Link>
                    );
                  })()}
                  {showAuthor ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                      <span>{byLabel}</span>
                      {record.isAnonymous ? (
                        <span>{anonymousLabel}</span>
                      ) : (
                        <Link
                          className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted"
                          href={localizePath(locale, `/u/${record.authorUsername}`)}
                        >
                          <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-surface-container-low text-[10px] font-semibold uppercase text-muted transition-opacity group-hover:opacity-70">
                            {record.authorAvatarUrl ? (
                              <img
                                alt={record.authorDisplayName}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                src={record.authorAvatarUrl}
                              />
                            ) : (
                              initialsFor(record.authorDisplayName)
                            )}
                          </span>
                          <span className="transition-opacity group-hover:opacity-70 group-hover:underline group-hover:decoration-muted-foreground">
                            {record.authorDisplayName}
                          </span>
                        </Link>
                      )}
                    </div>
                  ) : null}
                </div>
                <Link className="inline-flex" href={localizePath(locale, `/explore?type=${record.type}`)}>
                  <Badge className="transition-colors hover:bg-surface-container-high hover:text-primary">
                    <RecordIcon className="h-3.5 w-3.5" type={record.type} />
                    {typeLabels?.[record.type] ?? recordLabel(record.type)}
                  </Badge>
                </Link>
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
