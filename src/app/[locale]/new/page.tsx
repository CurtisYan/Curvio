import { redirect } from "next/navigation";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_editor_mode")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <RecordFormShell
        defaultEditorMode={profile?.preferred_editor_mode === "plain" ? "plain" : "markdown"}
        labels={messages.dashboard}
        locale={locale}
        note=""
        title={messages.dashboard.newTitle}
        userId={user.id}
      />
    </main>
  );
}
