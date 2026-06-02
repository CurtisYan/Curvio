import { redirect } from "next/navigation";
import { AuthShell } from "@/components/site/auth-shell";
import { signInAction } from "@/app/auth-actions";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { isUnsafeQueryMessage, safeQueryMessage } from "@/lib/safe-query-message";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; challenge?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, challenge } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  if (isUnsafeQueryMessage(error)) {
    redirect(`/${locale}/login`);
  }

  const safeError = safeQueryMessage(error, messages.auth.temporaryError);

  return (
    <AuthShell
      action={signInAction}
      error={safeError}
      challenge={challenge === "1"}
      labels={messages.auth}
      locale={locale}
      mode="login"
      note={messages.auth.note}
      submit={messages.auth.submitLogin}
      title={messages.auth.loginTitle}
    />
  );
}
