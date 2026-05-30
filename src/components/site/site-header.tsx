import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { AccountMenu } from "./account-menu";
import { LocaleSwitcher } from "./locale-switcher";

type NavMessages = {
  explore: string;
  donate: string;
  about: string;
  signIn: string;
  signOut: string;
  dashboard: string;
  new: string;
  profile: string;
  settings: string;
  language: string;
};

export function SiteHeader({
  locale,
  messages,
  user,
}: {
  locale: Locale;
  messages: NavMessages;
  user?: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
  } | null;
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
          {user ? (
            <AccountMenu
              labels={{
                signOut: messages.signOut,
                new: messages.new,
                profile: messages.profile,
                settings: messages.settings,
              }}
              locale={locale}
              user={user}
            />
          ) : (
            <Link
              className="text-sm font-medium text-primary transition-opacity hover:opacity-75"
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
