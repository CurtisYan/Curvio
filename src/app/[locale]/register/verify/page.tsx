import { resendOtpAction, verifyOtpAction } from "@/app/auth-actions";
import { VerifyOtpShell } from "@/components/site/verify-otp-shell";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

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

  return (
    <VerifyOtpShell
      email={email}
      error={error}
      labels={messages.auth}
      locale={locale}
      resendAction={resendOtpAction}
      sent={sent === "1"}
      verifyAction={verifyOtpAction}
    />
  );
}
