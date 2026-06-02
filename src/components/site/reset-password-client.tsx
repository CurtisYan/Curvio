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
  };
}) {
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error") ?? undefined;
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | undefined>();
  const error = queryError ?? sessionError;

  useEffect(() => {
    if (queryError) {
      return;
    }

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
          setSessionError(caughtError instanceof Error ? caughtError.message : labels.invalidLink);
        }
      }
    }

    void recoverSession();

    return () => {
      mounted = false;
    };
  }, [labels.invalidLink, queryError, searchParams]);

  if (error) {
    return (
      <ResetPasswordShell
        locale={locale}
        labels={labels}
        error={error}
        resetAction={completeResetAction}
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
      mode="ready"
    />
  );
}
