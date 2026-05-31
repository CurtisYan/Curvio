import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RecordCard } from "@/components/records/record-card";
import { ButtonLink } from "@/components/ui/button";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";
import { formatRecordPublicId } from "@/lib/record-public-id";
import { createClient } from "@/utils/supabase/server";

export default async function RecordsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: records } = await supabase
    .from("records")
    .select("id, type, title, content, date, is_anonymous, show_amount, amount, tags")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          {messages.dashboard.recordsTitle}
        </h1>
        <p className="mt-3 text-muted">{messages.dashboard.recordsLead}</p>
      </div>
      {records && records.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div className="space-y-3" key={record.id}>
              <RecordCard
                anonymousLabel={messages.common.anonymous}
                locale={locale}
                record={{
                  id: record.id,
                  type: record.type,
                  title: record.title,
                  content: record.content,
                  date: record.date,
                  authorUsername: profile?.username ?? "user",
                  authorDisplayName: profile?.display_name ?? "User",
                  isAnonymous: record.is_anonymous,
                  amountHidden: !record.show_amount && Boolean(record.amount),
                  tags: record.tags ?? [],
                  language: locale,
                }}
                typeLabels={{
                  donation: messages.common.recordDonation,
                  kindness: messages.common.recordKindness,
                  open_source: messages.common.recordOpenWork,
                }}
              />
              <ButtonLink
                className="w-full"
                href={localizePath(locale, `/records/${formatRecordPublicId(record.date, record.id)}/edit`)}
                variant="secondary"
              >
                {messages.dashboard.editRecord}
              </ButtonLink>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-border-subtle bg-surface-container-low px-6 py-8 text-sm text-muted">
          {messages.dashboard.recordsEmpty}
        </div>
      )}
    </main>
  );
}
