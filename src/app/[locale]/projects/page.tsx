import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RecordCard } from "@/components/records/record-card";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

export default async function ProjectsPage({
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

  const { data: projects } = await supabase
    .from("records")
    .select("id, type, title, content, date, is_anonymous, show_amount, amount, tags")
    .eq("user_id", user.id)
    .eq("type", "open_source")
    .order("date", { ascending: false });

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          {messages.dashboard.projects}
        </h1>
      </div>
      {projects && projects.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <RecordCard
              anonymousLabel={messages.common.anonymous}
              key={project.id}
              locale={locale}
              record={{
                id: project.id,
                type: project.type,
                title: project.title,
                content: project.content,
                date: project.date,
                authorUsername: profile?.username ?? "user",
                authorDisplayName: profile?.display_name ?? "User",
                isAnonymous: project.is_anonymous,
                amountHidden: !project.show_amount && Boolean(project.amount),
                tags: project.tags ?? [],
                language: locale,
              }}
              typeLabels={{
                donation: messages.common.recordDonation,
                kindness: messages.common.recordKindness,
                open_source: messages.common.recordOpenWork,
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-8 text-sm text-muted">No open-source records yet.</Card>
      )}
    </main>
  );
}
