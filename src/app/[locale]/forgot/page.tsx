import { ForgotPasswordShell } from "@/components/site/forgot-password-shell";
import { sendResetAction } from "@/app/auth-actions";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ForgotPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, sent } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <ForgotPasswordShell
      labels={{
        email: messages.auth.email,
        forgotTitle: messages.auth.forgotTitle,
        forgotNote: messages.auth.forgotNote,
        sendResetLink: messages.auth.sendResetLink,
        backToLogin: messages.auth.backToLogin,
      }}
      locale={locale}
      sendAction={sendResetAction}
      error={error}
      sent={sent === "1"}
    />
  );
}
