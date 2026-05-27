"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { RecordCard } from "@/components/records/record-card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import type { GoodwillRecord, RecordType } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterValue = "all" | RecordType;

export function RecordFilters({
  records,
  locale,
  labels,
}: {
  records: GoodwillRecord[];
  locale: Locale;
  labels: {
    all: string;
    donations: string;
    kindness: string;
    openWork: string;
    search: string;
    anonymous: string;
  };
}) {
  const [active, setActive] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");

  const filters: Array<{ value: FilterValue; label: string }> = [
    { value: "all", label: labels.all },
    { value: "donation", label: labels.donations },
    { value: "kindness", label: labels.kindness },
    { value: "open_source", label: labels.openWork },
  ];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      const typeMatch = active === "all" || record.type === active;
      const queryMatch =
        !normalizedQuery ||
        [record.title, record.content, record.organizationName, ...record.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return typeMatch && queryMatch;
    });
  }, [active, query, records]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-5 border-b border-border-subtle pb-6 md:flex-row md:items-center">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              className={cn(
                "h-11 shrink-0 rounded-full border px-5 text-sm transition-colors",
                active === filter.value
                  ? "border-surface-container-high bg-surface-container-high text-foreground"
                  : "border-border-subtle bg-surface-offwhite text-muted hover:bg-surface-container-low hover:text-primary",
              )}
              key={filter.value}
              onClick={() => setActive(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            value={query}
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((record) => (
          <RecordCard
            anonymousLabel={labels.anonymous}
            key={record.id}
            locale={locale}
            record={record}
            typeLabels={{
              donation: labels.donations,
              kindness: labels.kindness,
              open_source: labels.openWork,
            }}
          />
        ))}
      </div>
    </div>
  );
}
