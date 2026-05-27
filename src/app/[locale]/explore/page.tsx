import { RecordFilters } from "@/components/records/record-filters";
import { records } from "@/lib/mock-data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          {messages.explore.title}
        </h1>
        <p className="mt-3 text-lg leading-8 text-muted">{messages.explore.lead}</p>
      </div>
      <RecordFilters
        labels={{
          all: messages.explore.all,
          donations: messages.explore.donations,
          kindness: messages.explore.kindness,
          openWork: messages.explore.openWork,
          search: messages.explore.search,
          anonymous: messages.common.anonymous,
        }}
        locale={locale}
        records={records}
      />
    </main>
  );
}
