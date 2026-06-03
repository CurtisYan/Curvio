import { RecordFilters } from "@/components/records/record-filters";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

const filterTypes = new Set(["donation", "kindness", "open_source"] as const);

type PublicRecordImage = {
  id: string;
  record_id: string;
  r2_url: string;
  sort_order: number | null;
  is_cover: boolean | null;
  visibility: string | null;
};

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
    .from("public_records")
    .select(
      "id, type, title, content, reflection, date, is_anonymous, amount_hidden, organization_name, platform_name, project_url, tags, language, username, display_name, avatar_url",
    )
    .order("date", { ascending: false });

  const recordIds = (records ?? []).map((record) => record.id);
  const { data: images } = recordIds.length
    ? await supabase
        .from("record_images")
        .select("id, record_id, r2_url, sort_order, is_cover, visibility")
        .in("record_id", recordIds)
        .eq("visibility", "public")
    : { data: [] };

  const imagesByRecordId = new Map<string, PublicRecordImage[]>();
  for (const image of images ?? []) {
    const existing = imagesByRecordId.get(image.record_id) ?? [];
    existing.push(image);
    imagesByRecordId.set(image.record_id, existing);
  }

  const mappedRecords = (records ?? []).map((record) => {
    const recordImages = imagesByRecordId.get(record.id) ?? [];
    return {
      id: record.id,
      type: record.type,
      title: record.title,
      content: record.content,
      reflection: record.reflection ?? undefined,
      date: record.date,
      authorUsername: record.username ?? "anonymous",
      authorDisplayName:
        record.display_name ?? record.username ?? messages.common.anonymous,
      authorAvatarUrl: record.avatar_url ?? undefined,
      isAnonymous: record.is_anonymous,
      amountHidden: Boolean(record.amount_hidden),
      organizationName: record.organization_name ?? undefined,
      platformName: record.platform_name ?? undefined,
      projectUrl: record.project_url ?? undefined,
      tags: record.tags ?? [],
      language: record.language ?? "en",
      images: recordImages
        .filter((image) => image.visibility === "public")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((image) => ({
          id: image.id,
          url: image.r2_url,
          isCover: image.is_cover,
        })),
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
        key={initialFilter}
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
