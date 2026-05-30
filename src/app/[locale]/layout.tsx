import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const messages = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let headerUser: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
  } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, username")
      .eq("id", user.id)
      .maybeSingle();

    headerUser = {
      email: user.email,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      username: profile?.username ?? null,
    };
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SiteHeader locale={locale} messages={messages.nav} user={headerUser} />
      {children}
      <SiteFooter locale={locale} messages={messages.common} />
    </NextIntlClientProvider>
  );
}
