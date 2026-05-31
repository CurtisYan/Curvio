"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import { localizePath, type Locale } from "@/lib/i18n";

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

export function AccountMenu({
  locale,
  labels,
  user,
}: {
  locale: Locale;
  labels: {
    signOut: string;
    new: string;
    settings: string;
    profile: string;
  };
  user: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current) {
        return;
      }

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const profileHref = user.username
    ? localizePath(locale, `/u/${user.username}`)
    : localizePath(locale, "/new");

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-low text-xs font-semibold uppercase text-primary transition-colors hover:border-primary/50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {user.avatarUrl ? (
          <img
            alt={user.displayName ?? user.email ?? "User"}
            className="h-full w-full object-cover"
            loading="lazy"
            src={user.avatarUrl}
          />
        ) : (
          initialsFrom(user.displayName ?? user.email ?? "User")
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:w-52">
          <Link
            className="block px-4 py-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
            href={profileHref}
            onClick={() => setOpen(false)}
          >
            {labels.profile}
          </Link>
          <Link
            className="block px-4 py-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
            href={localizePath(locale, "/new")}
            onClick={() => setOpen(false)}
          >
            {labels.new}
          </Link>
          <Link
            className="block px-4 py-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
            href={localizePath(locale, "/settings")}
            onClick={() => setOpen(false)}
          >
            {labels.settings}
          </Link>
          <div className="border-t border-border-subtle" />
          <form action={signOutAction}>
            <input name="locale" type="hidden" value={locale} />
            <button
              className="block w-full px-4 py-3 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
              type="submit"
            >
              {labels.signOut}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
