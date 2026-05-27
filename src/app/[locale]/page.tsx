import { HomeSections } from "@/components/sections/home-sections";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return <HomeSections locale={locale} messages={{ ...messages.common, ...messages.home }} />;
}
