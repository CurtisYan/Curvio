"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  resendCooldown: string;
  alreadyHaveAccount: string;
};

function readCooldownSeconds(message?: string) {
  if (!message) {
    return 0;
  }

  const match = message.match(/(\d+)\s*(?:seconds?|秒)/i);
  return match ? Number(match[1]) : 0;
}

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
  const initialCooldown = useMemo(() => readCooldownSeconds(error) || (sent ? 60 : 0), [error, sent]);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const lockedEmail = Boolean(email);
  const displayedError = cooldown > 0
    ? labels.resendCooldown.replace("{seconds}", String(cooldown))
    : error;

  useEffect(() => {
    setCooldown(initialCooldown);
  }, [initialCooldown]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-7">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{labels.verificationTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{labels.verificationNote}</p>
        </div>
        {displayedError ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {displayedError}
          </div>
        ) : null}
        {sent ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.codeSent}
          </div>
        ) : null}
        <form action={verifyAction} className="space-y-6">
          <input name="locale" type="hidden" value={locale} />
          <label className="space-y-2 text-sm font-medium">
            {labels.email}
            <Input
              autoComplete="email"
              className={lockedEmail ? "cursor-not-allowed bg-surface-container text-muted" : undefined}
              defaultValue={email}
              name="email"
              placeholder="you@example.com"
              readOnly={lockedEmail}
              required
              type="email"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {labels.verificationCode}
            <Input autoComplete="one-time-code" inputMode="numeric" maxLength={8} name="token" pattern="[0-9]{8}" required />
          </label>
          <Button className="mt-2 w-full" type="submit">
            {labels.verifyEmail}
          </Button>
        </form>
        <form action={resendAction}>
          <input name="locale" type="hidden" value={locale} />
          <input name="email" type="hidden" value={email ?? ""} />
          <Button className="w-full" disabled={cooldown > 0} type="submit" variant="secondary">
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
