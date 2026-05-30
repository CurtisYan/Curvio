import { ResetPasswordShell } from "@/components/site/reset-password-shell";
import { completeResetAction } from "@/app/auth-actions";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <ResetPasswordShell
      locale={locale}
      labels={{
        resetTitle: messages.auth.resetTitle,
        resetNote: messages.auth.resetNote,
        setPassword: messages.auth.setPassword,
        backToLogin: messages.auth.backToLogin,
      }}
      error={error}
      resetAction={completeResetAction}
    />
  );
}
