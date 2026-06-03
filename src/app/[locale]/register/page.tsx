import { redirect } from "next/navigation";
import { AuthShell } from "@/components/site/auth-shell";
import { CleanUrlOnMount } from "@/components/site/clean-url-on-mount";
import { signUpAction } from "@/app/auth-actions";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { isUnsafeQueryMessage, safeQueryMessage } from "@/lib/safe-query-message";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; email?: string; username?: string; display_name?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, email, username, display_name: displayName } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  if (isUnsafeQueryMessage(error)) {
    redirect(`/${locale}/register`);
  }

  const safeError = safeQueryMessage(error, messages.auth.temporaryError);

  return (
    <>
    <AuthShell
      action={signUpAction}
      defaultDisplayName={displayName}
      defaultEmail={email}
      defaultUsername={username}
      error={safeError}
      labels={messages.auth}
      locale={locale}
      mode="register"
      note={messages.auth.note}
      submit={messages.auth.submitRegister}
      title={messages.auth.registerTitle}
    />
    {error || email || username || displayName ? <CleanUrlOnMount /> : null}
    </>
  );
}
