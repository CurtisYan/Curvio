import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

type VerifyLabels = {
  email: string;
  verificationTitle: string;
  verificationNote: string;
  verificationCode: string;
  verifyEmail: string;
  resendCode: string;
  codeSent: string;
  alreadyHaveAccount: string;
};

export function VerifyOtpShell({
  locale,
  labels,
  email,
  error,
  sent,
  verifyAction,
  resendAction,
}: {
  locale: Locale;
  labels: VerifyLabels;
  email?: string;
  error?: string;
  sent?: boolean;
  verifyAction: (formData: FormData) => void | Promise<void>;
  resendAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{labels.verificationTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{labels.verificationNote}</p>
        </div>
        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </div>
        ) : null}
        {sent ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.codeSent}
          </div>
        ) : null}
        <form action={verifyAction} className="space-y-4">
          <input name="locale" type="hidden" value={locale} />
          <label className="space-y-2 text-sm font-medium">
            {labels.email}
            <Input autoComplete="email" defaultValue={email} name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {labels.verificationCode}
            <Input autoComplete="one-time-code" inputMode="numeric" maxLength={6} name="token" pattern="[0-9]{6}" placeholder="123456" required />
          </label>
          <Button className="w-full" type="submit">
            {labels.verifyEmail}
          </Button>
        </form>
        <form action={resendAction}>
          <input name="locale" type="hidden" value={locale} />
          <input name="email" type="hidden" value={email ?? ""} />
          <Button className="w-full" type="submit" variant="secondary">
            {labels.resendCode}
          </Button>
        </form>
        <div className="border-t border-border-subtle pt-4 text-center text-sm text-muted">
          <Link className="text-primary hover:text-primary-strong" href={localizePath(locale, "/login")}>
            {labels.alreadyHaveAccount}
          </Link>
        </div>
      </Card>
    </main>
  );
}
