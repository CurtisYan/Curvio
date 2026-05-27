import { AuthShell } from "@/components/site/auth-shell";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <AuthShell
      labels={messages.auth}
      locale={locale}
      mode="login"
      note={messages.auth.note}
      submit={messages.auth.submitLogin}
      title={messages.auth.loginTitle}
    />
  );
}
