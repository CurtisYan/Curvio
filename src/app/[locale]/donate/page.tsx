import { Info } from "lucide-react";
import { PlatformCard } from "@/components/sections/platform-card";
import { Card } from "@/components/ui/card";
import { donationPlatforms } from "@/lib/mock-data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-primary">
          {messages.donate.title}
        </h1>
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-6 text-xl font-medium leading-8 text-primary">
          {messages.donate.notice}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {donationPlatforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            locale={locale}
            platform={platform}
            visitLabel={messages.common.visitOfficial}
          />
        ))}
        <Card className="flex min-h-[250px] flex-col items-center justify-center text-center md:col-span-2">
          <Info className="mb-4 h-10 w-10 text-muted" />
          <h2 className="text-2xl font-medium text-primary">
            {messages.donate.transparencyTitle}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {messages.donate.transparencyBody}
          </p>
        </Card>
      </div>
    </main>
  );
}
