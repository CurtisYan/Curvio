import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";

export function ResetPasswordShell({
  locale,
  labels,
  error,
  resetAction,
  mode = "ready",
}: {
  locale: Locale;
  labels: {
    resetTitle: string;
    resetNote: string;
    setPassword: string;
    backToLogin: string;
    linkingAccount: string;
    invalidLink: string;
    passwordUpdated: string;
  };
  error?: string;
  resetAction: (formData: FormData) => void | Promise<void>;
  mode?: "ready" | "loading" | "error";
}) {
  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-7">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{labels.resetTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{labels.resetNote}</p>
        </div>
        {mode === "loading" ? (
          <div className="rounded-lg border border-border-subtle bg-surface-container-low px-3 py-2 text-sm text-muted">
            {labels.linkingAccount}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
        {mode === "ready" ? (
          <form action={resetAction} className="space-y-5">
            <input name="locale" type="hidden" value={locale} />
            <label className="space-y-2 text-sm font-medium">
              {labels.setPassword}
              <Input autoComplete="new-password" minLength={6} name="password" placeholder={labels.setPassword} required type="password" />
            </label>
            <Button className="w-full" type="submit">
              {labels.setPassword}
            </Button>
          </form>
        ) : null}
        <div className="border-t border-border-subtle pt-4 text-center text-sm text-muted">
          <a className="text-primary hover:text-primary-strong" href={`/${locale}/login`}>
            {labels.backToLogin}
          </a>
        </div>
      </Card>
    </main>
  );
}
