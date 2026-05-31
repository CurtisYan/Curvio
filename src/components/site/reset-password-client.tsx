"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { completeResetAction } from "@/app/auth-actions";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/lib/i18n";
import { ResetPasswordShell } from "./reset-password-shell";

export function ResetPasswordClient({
  locale,
  labels,
  turnstileSiteKey,
}: {
  locale: Locale;
  labels: {
    resetTitle: string;
    resetNote: string;
    setPassword: string;
    backToLogin: string;
    linkingAccount: string;
    invalidLink: string;
    passwordTooShort: string;
    passwordUpdated: string;
    turnstileMissing: string;
  };
  turnstileSiteKey: string;
}) {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>(searchParams.get("error") ?? undefined);

  useEffect(() => {
    let mounted = true;

    async function recoverSession() {
      const supabase = createClient();
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        } else if (tokenHash && type === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (verifyError) {
            throw verifyError;
          }
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            throw new Error(labels.invalidLink);
          }
        }

        if (mounted) {
          setReady(true);
        }
      } catch (caughtError) {
        if (mounted) {
          setError(caughtError instanceof Error ? caughtError.message : labels.invalidLink);
        }
      }
    }

    void recoverSession();

    return () => {
      mounted = false;
    };
  }, [labels.invalidLink, searchParams]);

  useEffect(() => {
    setError(searchParams.get("error") ?? undefined);
  }, [searchParams]);

  if (error) {
    return (
      <ResetPasswordShell
        locale={locale}
        labels={labels}
        error={error}
        resetAction={completeResetAction}
        turnstileSiteKey={turnstileSiteKey}
        mode="error"
      />
    );
  }

  if (!ready) {
    return (
      <ResetPasswordShell
        locale={locale}
        labels={labels}
        error={undefined}
        resetAction={completeResetAction}
        turnstileSiteKey={turnstileSiteKey}
        mode="loading"
      />
    );
  }

  return (
    <ResetPasswordShell
      locale={locale}
      labels={labels}
      error={undefined}
      resetAction={completeResetAction}
      turnstileSiteKey={turnstileSiteKey}
      mode="ready"
    />
  );
}
