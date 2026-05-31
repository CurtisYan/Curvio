import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RecordFormShell } from "@/components/dashboard/record-form-shell";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

export default async function NewRecordPage({
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

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-8">
        <RecordFormShell
          labels={messages.dashboard}
          locale={locale}
          note=""
          title={messages.dashboard.newTitle}
        />
      </div>
    </main>
  );
}
