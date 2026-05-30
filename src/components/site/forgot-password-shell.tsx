import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

export function ForgotPasswordShell({
  locale,
  labels,
  sendAction,
  error,
  sent,
}: {
  locale: Locale;
  labels: {
    email: string;
    forgotTitle: string;
    forgotNote: string;
    sendResetLink: string;
    backToLogin: string;
    resetLinkSent: string;
  };
  sendAction: (formData: FormData) => void | Promise<void>;
  error?: string;
  sent?: boolean;
}) {
  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-7">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{labels.forgotTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{labels.forgotNote}</p>
        </div>
        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
        {sent ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.resetLinkSent}
          </div>
        ) : null}
        <form action={sendAction} className="space-y-5">
          <input name="locale" type="hidden" value={locale} />
          <label className="space-y-2 text-sm font-medium">
            {labels.email}
            <Input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
          </label>
          <Button className="w-full" type="submit">
            {labels.sendResetLink}
          </Button>
        </form>
        <div className="border-t border-border-subtle pt-4 text-center text-sm text-muted">
          <a className="text-primary hover:text-primary-strong" href={localizePath(locale, "/login")}>
            {labels.backToLogin}
          </a>
        </div>
      </Card>
    </main>
  );
}
