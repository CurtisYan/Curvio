import { redirect } from "next/navigation";
import { DashboardArchiveView } from "@/components/dashboard/dashboard-archive-view";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage({
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

  if (!profile?.username || !profile.display_name) {
    redirect(`/${locale}/new`);
  }

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-8">
        <DashboardArchiveView
          locale={locale}
          labels={messages.dashboard}
          mode="overview"
          profile={{ username: profile.username, display_name: profile.display_name }}
          records={records ?? []}
        />
      </div>
    </main>
  );
}
