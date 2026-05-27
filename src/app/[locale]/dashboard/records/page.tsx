import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RecordCard } from "@/components/records/record-card";
import { records } from "@/lib/mock-data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function RecordsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          {messages.dashboard.recordsTitle}
        </h1>
        <p className="mt-3 text-muted">{messages.dashboard.comingSoon}</p>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <RecordCard
            anonymousLabel={messages.common.anonymous}
            key={record.id}
            locale={locale}
            record={record}
            typeLabels={{
              donation: messages.common.recordDonation,
              kindness: messages.common.recordKindness,
              open_source: messages.common.recordOpenWork,
            }}
          />
        ))}
      </div>
    </main>
  );
}
