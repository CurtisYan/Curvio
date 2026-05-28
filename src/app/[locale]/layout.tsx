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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SiteHeader locale={locale} messages={messages.nav} userEmail={user?.email} />
      {children}
      <SiteFooter locale={locale} messages={messages.common} />
    </NextIntlClientProvider>
  );
}
