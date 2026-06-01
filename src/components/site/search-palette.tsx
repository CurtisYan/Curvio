"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { buildSearchSnippet, matchesSearchQuery, splitHighlightedText } from "@/lib/search";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { formatRecordPublicId } from "@/lib/record-public-id";
import { recordTypeToSegment } from "@/lib/record-types";

type SearchPaletteLabels = {
  title: string;
  placeholder: string;
  loading: string;
  users: string;
  records: string;
  usersEmpty: string;
  recordsEmpty: string;
  empty: string;
  hint: string;
  anonymous: string;
  by: string;
  recordDonation: string;
  recordKindness: string;
  recordOpenWork: string;
};

type SearchCommonLabels = {
  anonymous: string;
  by: string;
  recordDonation: string;
  recordKindness: string;
  recordOpenWork: string;
};

type SearchUser = {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

type SearchRecord = {
  id: string;
  type: "donation" | "kindness" | "open_source";
  title: string;
  content: string;
  reflection?: string | null;
  date: string;
  authorUsername: string;
  authorDisplayName: string;
  isAnonymous: boolean;
  organizationName?: string | null;
  platformName?: string | null;
  tags: string[];
};

function initialsFrom(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function highlightWithMark(text: string, query: string) {
  return splitHighlightedText(text, query).map((segment, index) =>
    segment.highlighted ? (
      <mark
        className="rounded bg-primary/15 px-0.5 text-foreground"
        key={`${segment.text}-${index}`}
      >
        {segment.text}
      </mark>
    ) : (
      <span key={`${segment.text}-${index}`}>{segment.text}</span>
    ),
  );
}

function SearchSection({
  title,
  count,
  emptyLabel,
  children,
}: {
  title: string;
  count: number;
  emptyLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {title}
        </h2>
        <span className="text-xs text-muted">{count}</span>
      </div>
      {count > 0 ? (
        <div className="space-y-2">{children}</div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border-subtle bg-surface-offwhite px-4 py-5 text-sm text-muted">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}

export function SearchPalette({
  open,
  locale,
  labels,
  common,
  query,
  setQuery,
  data,
  error,
  loading,
  onClose,
}: {
  open: boolean;
  locale: Locale;
  labels: SearchPaletteLabels;
  common: SearchCommonLabels;
  query: string;
  setQuery: (value: string) => void;
  data: { users: SearchUser[]; records: SearchRecord[] } | null;
  error: string | null;
  loading: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const normalizedQuery = query.trim();
  const users = useMemo(() => data?.users ?? [], [data]);
  const records = useMemo(() => data?.records ?? [], [data]);
  const hasQuery = normalizedQuery.length > 0;

  const filteredUsers = useMemo(() => {
    const ranked = users
      .filter((user) =>
        matchesSearchQuery([user.username], normalizedQuery),
      )
      .sort((left, right) => left.username.localeCompare(right.username));

    return ranked;
  }, [normalizedQuery, users]);

  const filteredRecords = useMemo(() => {
    const ranked = records
      .filter((record) =>
        matchesSearchQuery(
          [
            record.title,
            record.content,
            record.reflection,
          ],
          normalizedQuery,
        ),
      )
      .sort((left, right) => right.date.localeCompare(left.date));

    return ranked;
  }, [normalizedQuery, records]);

  const hasResults = filteredUsers.length > 0 || filteredRecords.length > 0;

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-black/45 px-4 pt-20 backdrop-blur-xl"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-border-subtle/80 bg-surface shadow-[0_10px_32px_rgba(31,35,40,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border-subtle/70 px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <div className="relative flex min-w-0 flex-1 items-center">
            <Input
              ref={inputRef}
              className="h-10 border-0 bg-transparent px-0 pr-10 text-base shadow-none outline-none placeholder:text-muted/90 focus:border-0 focus:ring-0 focus:outline-none focus-visible:outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.placeholder}
              value={query}
            />
            {query.length > 0 ? (
              <button
                aria-label="Clear search"
                className="absolute right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-surface-offwhite text-muted transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => setQuery("")}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <button
            aria-label={labels.title}
            className="inline-flex h-8 items-center rounded-full border border-border-subtle/80 bg-surface-offwhite px-2.5 text-xs text-muted transition-colors hover:border-primary/30 hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5">
          {loading && hasQuery ? (
            <p className="rounded-2xl border border-border-subtle/70 bg-surface-offwhite px-4 py-5 text-sm text-muted shadow-[0_1px_0_rgba(255,255,255,0.45)_inset]">
              {labels.loading}
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-border-subtle/70 bg-surface-offwhite px-4 py-5 text-sm text-muted shadow-[0_1px_0_rgba(255,255,255,0.45)_inset]">
              {error}
            </p>
          ) : hasQuery ? (
            <div className="space-y-5">
              <SearchSection
                count={filteredUsers.length}
                emptyLabel={labels.usersEmpty}
                title={labels.users}
              >
                {filteredUsers.map((user) => (
                  <Link
                    className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-offwhite px-4 py-3 transition-colors hover:border-primary/30 hover:bg-surface-container-low"
                    href={localizePath(locale, `/u/${user.username}`)}
                    key={user.username}
                    onClick={onClose}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-low text-sm font-semibold uppercase text-primary">
                      {user.avatarUrl ? (
                        <img
                          alt={user.displayName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          src={user.avatarUrl}
                        />
                      ) : (
                        initialsFrom(user.displayName)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {user.displayName}
                        </span>
                        <span className="text-sm text-muted">
                          @{highlightWithMark(user.username, query)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </SearchSection>

              <SearchSection
                count={filteredRecords.length}
                emptyLabel={labels.recordsEmpty}
                title={labels.records}
              >
                {filteredRecords.map((record) => {
                  const publicRecordId = formatRecordPublicId(record.date, record.id);
                  const href = localizePath(
                    locale,
                    `/u/${record.authorUsername}/${recordTypeToSegment(record.type)}/${publicRecordId}`,
                  );
                  const typeLabel =
                    record.type === "donation"
                      ? common.recordDonation
                      : record.type === "kindness"
                        ? common.recordKindness
                        : common.recordOpenWork;
                  const snippet = buildSearchSnippet(record.reflection || record.content, query);

                  return (
                    <Link
                      className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-offwhite px-4 py-3 transition-colors hover:border-primary/30 hover:bg-surface-container-low"
                      href={href}
                      key={record.id}
                      onClick={onClose}
                    >
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-container-low text-xs font-semibold uppercase text-primary">
                        {record.type.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                            {typeLabel}
                          </span>
                          <span className="text-xs text-muted">
                            {new Intl.DateTimeFormat(locale, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(record.date))}
                          </span>
                        </div>
                        <p className="font-medium text-foreground">
                          {highlightWithMark(record.title, query)}
                        </p>
                        {snippet ? <p className="text-sm text-on-surface-variant">{highlightWithMark(snippet, query)}</p> : null}
                        <p className="text-sm text-muted">
                          {record.isAnonymous ? common.anonymous : `${common.by} ${record.authorDisplayName}`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </SearchSection>

              {!hasResults ? (
                <p className="rounded-2xl border border-dashed border-border-subtle/70 bg-surface-offwhite px-4 py-6 text-sm text-muted shadow-[0_1px_0_rgba(255,255,255,0.45)_inset]">
                  {labels.empty}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
