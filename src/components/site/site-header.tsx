import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { LocaleSwitcher } from "./locale-switcher";

type NavMessages = {
  explore: string;
  donate: string;
  about: string;
  signIn: string;
  signOut: string;
  dashboard: string;
  language: string;
};

export function SiteHeader({
  locale,
  messages,
  userEmail,
}: {
  locale: Locale;
  messages: NavMessages;
  userEmail?: string | null;
}) {
  const nav = [
    { href: "/explore", label: messages.explore },
    { href: "/donate", label: messages.donate },
    { href: "/about", label: messages.about },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            className="font-sans text-2xl font-medium text-primary"
            href={localizePath(locale)}
          >
            Curvio
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                className="text-sm text-muted transition-colors hover:text-primary"
                href={localizePath(locale, item.href)}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher label={messages.language} locale={locale} />
          {userEmail ? (
            <>
              <Link
                className="hidden text-sm font-medium text-primary transition-opacity hover:opacity-75 sm:inline-flex"
                href={localizePath(locale, "/dashboard")}
              >
                {messages.dashboard}
              </Link>
              <form action={signOutAction} className="hidden sm:block">
                <input name="locale" type="hidden" value={locale} />
                <button
                  className="text-sm text-muted transition-colors hover:text-primary"
                  type="submit"
                >
                  {messages.signOut}
                </button>
              </form>
            </>
          ) : (
            <Link
              className="hidden text-sm font-medium text-primary transition-opacity hover:opacity-75 sm:inline-flex"
              href={localizePath(locale, "/login")}
            >
              {messages.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
