import { ForgotPasswordShell } from "@/components/site/forgot-password-shell";
import { sendResetAction } from "@/app/auth-actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ForgotPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, sent: querySent } = await searchParams;
  const cookieStore = await cookies();
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const cookieSent = cookieStore.get("curvio_reset_sent")?.value === "1";

  if (querySent === "1") {
    redirect(`/${locale}/forgot`);
  }

  return (
    <ForgotPasswordShell
      labels={{
        email: messages.auth.email,
        forgotTitle: messages.auth.forgotTitle,
        forgotNote: messages.auth.forgotNote,
        sendResetLink: messages.auth.sendResetLink,
        backToLogin: messages.auth.backToLogin,
        resetLinkSent: messages.auth.resetLinkSent,
        turnstileMissing: messages.auth.turnstileMissing,
      }}
      locale={locale}
      turnstileSiteKey={turnstileSiteKey}
      sendAction={sendResetAction}
      error={error}
      sent={cookieSent}
    />
  );
}
