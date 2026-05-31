import { AuthShell } from "@/components/site/auth-shell";
import { signInAction } from "@/app/auth-actions";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

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

  return (
    <AuthShell
      action={signInAction}
      error={error}
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
