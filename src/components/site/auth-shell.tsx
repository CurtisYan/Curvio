import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { TurnstileWidget } from "@/components/site/turnstile-widget";

type AuthLabels = {
  email: string;
  password: string;
  username: string;
  createAccount: string;
  alreadyHaveAccount: string;
};

export function AuthShell({
  locale,
  title,
  submit,
  note,
  labels,
  mode,
  action,
  error,
}: {
  locale: Locale;
  title: string;
  submit: string;
  note: string;
  labels: AuthLabels;
  mode: "login" | "register";
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
}) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{note}</p>
        </div>
        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </div>
        ) : null}
        <form action={action} className="space-y-6">
          <input name="locale" type="hidden" value={locale} />
          {mode === "register" ? (
            <label className="space-y-2 text-sm font-medium">
              {labels.username}
              <Input autoComplete="username" name="username" placeholder="elara_writes" required />
            </label>
          ) : null}
          <label className="space-y-2 text-sm font-medium">
            {labels.email}
            <Input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {labels.password}
            <Input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={6}
              name="password"
              placeholder="password"
              required
              type="password"
            />
          </label>
          {mode === "register" && turnstileSiteKey ? (
            <TurnstileWidget siteKey={turnstileSiteKey} />
          ) : null}
          <Button className="w-full" type="submit">
            {submit}
          </Button>
        </form>
        <div className="border-t border-border-subtle pt-4 text-center text-sm text-muted space-y-2">
          {mode === "login" ? (
            <>
              <Link className="text-primary hover:text-primary-strong block" href={localizePath(locale, "/register")}>
                {labels.createAccount}
              </Link>
              <Link className="text-muted hover:text-muted-foreground block" href={localizePath(locale, "/forgot")}>
                Forgot password?
              </Link>
            </>
          ) : (
            <Link className="text-primary hover:text-primary-strong" href={localizePath(locale, "/login")}>
              {labels.alreadyHaveAccount}
            </Link>
          )}
        </div>
      </Card>
    </main>
  );
}
