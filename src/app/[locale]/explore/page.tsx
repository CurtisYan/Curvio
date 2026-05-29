import { RecordFilters } from "@/components/records/record-filters";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

const filterTypes = new Set(["donation", "kindness", "open_source"] as const);

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { type } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const supabase = await createClient();
  const { data: records } = await supabase
    .from("records")
    .select(
      "id, type, title, content, reflection, date, is_anonymous, show_amount, amount, organization_name, platform_name, project_url, tags, language, profiles(username, display_name, avatar_url)",
    )
    .eq("is_public", true)
    .order("date", { ascending: false });

  const mappedRecords = (records ?? []).map((record) => {
    const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;
    return {
      id: record.id,
      type: record.type,
      title: record.title,
      content: record.content,
      reflection: record.reflection ?? undefined,
      date: record.date,
      authorUsername: profile?.username ?? "anonymous",
      authorDisplayName:
        profile?.display_name ?? profile?.username ?? messages.common.anonymous,
      authorAvatarUrl: profile?.avatar_url ?? undefined,
      isAnonymous: record.is_anonymous,
      amountHidden: Boolean(record.amount) && !record.show_amount,
      organizationName: record.organization_name ?? undefined,
      platformName: record.platform_name ?? undefined,
      projectUrl: record.project_url ?? undefined,
      tags: record.tags ?? [],
      language: record.language ?? "en",
    };
  });

  const initialFilter = filterTypes.has(type as "donation" | "kindness" | "open_source")
    ? (type as "donation" | "kindness" | "open_source")
    : "all";

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          {messages.explore.title}
        </h1>
        <p className="mt-3 text-lg leading-8 text-muted">{messages.explore.lead}</p>
      </div>
      <RecordFilters
        initialFilter={initialFilter}
        labels={{
          all: messages.explore.all,
          donations: messages.explore.donations,
          kindness: messages.explore.kindness,
          openWork: messages.explore.openWork,
          search: messages.explore.search,
          anonymous: messages.common.anonymous,
        }}
        locale={locale}
        records={mappedRecords}
      />
    </main>
  );
}
