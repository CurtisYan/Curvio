"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

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

  if (error) {
    return (
      <ResetPasswordShell
        locale={locale}
        labels={labels}
        error={error}
        resetAction={async () => {}}
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
        resetAction={async () => {}}
        mode="loading"
      />
    );
  }

  return (
    <ResetPasswordShell
      locale={locale}
      labels={labels}
      error={undefined}
      resetAction={async (formData) => {
        const password = String(formData.get("password") ?? "").trim();
        if (password.length < 6) {
          setError(labels.passwordTooShort);
          return;
        }

        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          setError(updateError.message);
          return;
        }

        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", userId)
            .maybeSingle();

          if (profile?.username) {
            router.push(`/${locale}/u/${profile.username}`);
            return;
          }
        }

        router.push(`/${locale}/new`);
      }}
      mode="ready"
    />
  );
}
