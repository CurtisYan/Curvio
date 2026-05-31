import { ResetPasswordClient } from "@/components/site/reset-password-client";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ResetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <ResetPasswordClient
      locale={locale}
      labels={{
        resetTitle: messages.auth.resetTitle,
        resetNote: messages.auth.resetNote,
        setPassword: messages.auth.setPassword,
        backToLogin: messages.auth.backToLogin,
        linkingAccount: messages.auth.linkingAccount,
        invalidLink: messages.auth.invalidLink,
        passwordTooShort: messages.auth.passwordTooShort,
        passwordUpdated: messages.auth.passwordUpdated,
        turnstileMissing: messages.auth.turnstileMissing,
      }}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}
