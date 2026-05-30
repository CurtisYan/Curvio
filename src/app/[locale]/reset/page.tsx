import { ResetPasswordShell } from "@/components/site/reset-password-shell";
import { completeResetAction } from "@/app/auth-actions";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ access_token?: string; error?: string }>; 
}) {
  const { locale: rawLocale } = await params;
  const { access_token, error } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <ResetPasswordShell
      locale={locale}
      labels={messages.auth}
      token={access_token}
      error={error}
      resetAction={completeResetAction}
    />
  );
}
