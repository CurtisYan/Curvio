import { redirect } from "next/navigation";
import { resendOtpAction, verifyOtpAction } from "@/app/auth-actions";
import { CleanUrlOnMount } from "@/components/site/clean-url-on-mount";
import { VerifyOtpShell } from "@/components/site/verify-otp-shell";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { isUnsafeQueryMessage, safeQueryMessage } from "@/lib/safe-query-message";

export default async function VerifyRegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; error?: string; sent?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { email, error, sent } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  if (isUnsafeQueryMessage(error)) {
    const params = new URLSearchParams();
    if (email) {
      params.set("email", email);
    }
    if (sent) {
      params.set("sent", sent);
    }
    redirect(`/${locale}/register/verify${params.size > 0 ? `?${params.toString()}` : ""}`);
  }

  const safeError = safeQueryMessage(error, messages.auth.temporaryError);

  return (
    <>
    <VerifyOtpShell
      email={email}
      error={safeError}
      labels={messages.auth}
      locale={locale}
      resendAction={resendOtpAction}
      sent={sent === "1"}
      verifyAction={verifyOtpAction}
    />
    {error || sent ? <CleanUrlOnMount /> : null}
    </>
  );
}
