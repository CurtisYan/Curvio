"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchPalette } from "@/components/site/search-palette";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

type SearchResponse = {
  users: SearchUser[];
  records: SearchRecord[];
};

function getShortcutLabel(isMac: boolean) {
  return isMac ? "Cmd K" : "Ctrl K";
}

function getNavigatorPlatform() {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return nav.userAgentData?.platform ?? nav.platform ?? "";
}

export function SearchTrigger({
  locale,
  label,
  search,
  common,
  className,
}: {
  locale: Locale;
  label: string;
  search: {
    title: string;
    placeholder: string;
    loading: string;
    users: string;
    records: string;
    usersEmpty: string;
    recordsEmpty: string;
    empty: string;
    hint: string;
  };
  common: {
    anonymous: string;
    by: string;
    recordDonation: string;
    recordKindness: string;
    recordOpenWork: string;
  };
  className?: string;
}) {
  const [isMac] = useState(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const platform = getNavigatorPlatform();
    return /mac/i.test(platform);
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const shortcutLabel = useMemo(() => getShortcutLabel(isMac), [isMac]);

  const loadSearchIndex = useCallback(() => {
    if (data || loading) {
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    fetch("/api/search-index", {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }

        return (await response.json()) as SearchResponse;
      })
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : search.empty);
        setLoading(false);
      });
  }, [data, loading, search.empty]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  const closeSearch = useCallback(() => {
    controllerRef.current?.abort();
    setOpen(false);
    setQuery("");
    setError(null);
    setLoading(false);
  }, []);

  const toggleSearch = useCallback(() => {
    if (open) {
      closeSearch();
      return;
    }

    openSearch();
  }, [closeSearch, open, openSearch]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (value.trim()) {
        loadSearchIndex();
      }
    },
    [loadSearchIndex],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        toggleSearch();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [toggleSearch]);

  return (
    <>
      <button
        aria-label={label}
        aria-haspopup="dialog"
        className={cn(
          "hidden h-9 w-full max-w-[180px] items-center justify-between gap-2 rounded-full border border-border-subtle bg-surface-offwhite px-2.5 text-[12px] text-muted shadow-[0_1px_0_rgba(255,255,255,0.45)_inset] transition-colors hover:border-primary/30 hover:bg-surface-container-low hover:text-primary md:flex",
          className,
        )}
        onClick={toggleSearch}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
          <span className="truncate">{label}</span>
        </span>
        <kbd className="inline-flex items-center rounded-full border border-border-subtle bg-surface px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-muted">
          {shortcutLabel}
        </kbd>
      </button>
      <SearchPalette
        common={common}
        data={data}
        error={error}
        labels={{
          title: search.title,
          placeholder: search.placeholder,
          loading: search.loading,
          users: search.users,
          records: search.records,
          usersEmpty: search.usersEmpty,
          recordsEmpty: search.recordsEmpty,
          empty: search.empty,
          hint: search.hint,
          anonymous: common.anonymous,
          by: common.by,
          recordDonation: common.recordDonation,
          recordKindness: common.recordKindness,
          recordOpenWork: common.recordOpenWork,
        }}
        loading={loading}
        locale={locale}
        onClose={closeSearch}
        open={open}
        query={query}
        setQuery={handleQueryChange}
      />
    </>
  );
}
