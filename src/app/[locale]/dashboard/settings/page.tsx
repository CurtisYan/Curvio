import { updateProfileSettingsAction } from "@/app/dashboard-actions";
import { AvatarUploader } from "@/components/dashboard/avatar-uploader";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProfileLayoutSorter } from "@/components/dashboard/profile-layout-sorter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { status, message } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select(
      "display_name, avatar_url, bio, principle, website_url, is_public, allow_follow, hide_amounts_by_default, show_annual_summary",
    )
    .eq("id", user!.id)
    .maybeSingle();

  const { data: currentSections } = await supabase
    .from("profile_sections")
    .select("section_type, sort_order, is_visible")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true });

  const sectionLabels: Record<string, string> = {
    timeline: messages.profile.publicLedger,
    donations: messages.dashboard.sectionDonations,
    kindness: messages.dashboard.sectionKindness,
    open_source: messages.dashboard.sectionProjects,
    annual_summary: messages.dashboard.sectionAnnual,
  };
  const sections =
    currentSections && currentSections.length > 0
      ? currentSections
          .filter((section) => sectionLabels[section.section_type])
          .map((section) => ({
            id: section.section_type,
            label: sectionLabels[section.section_type],
            visible: section.is_visible,
          }))
      : [
          { id: "timeline", label: messages.profile.publicLedger, visible: true },
          { id: "donations", label: messages.dashboard.sectionDonations, visible: true },
          { id: "kindness", label: messages.dashboard.sectionKindness, visible: true },
          { id: "open_source", label: messages.dashboard.sectionProjects, visible: true },
          { id: "annual_summary", label: messages.dashboard.sectionAnnual, visible: true },
        ];

  const initials = String(currentProfile?.display_name ?? user?.email ?? "CU")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <form action={updateProfileSettingsAction}>
        <input name="locale" type="hidden" value={locale} />
        <Card className="mt-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {messages.dashboard.settingsTitle}
            </h1>
          </div>
          {status === "saved" ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
              {messages.dashboard.settingsSaved}
            </div>
          ) : null}
          {status === "error" ? (
            <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
              {message ?? messages.dashboard.settingsError}
            </div>
          ) : null}

        <section className="space-y-4 border-t border-border-subtle pt-6">
          <h2 className="text-xl font-medium">
            {messages.dashboard.profileSettingsTitle}
          </h2>
          <div className="flex flex-col gap-5 md:flex-row">
            <AvatarUploader
              avatarUrl={currentProfile?.avatar_url}
              changeLabel={messages.dashboard.avatarChange}
              helpText={messages.dashboard.avatarHelp}
              initials={initials}
              label={messages.dashboard.avatarUpload}
            />
            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.displayName}
                <Input
                  defaultValue={currentProfile?.display_name ?? user?.email?.split("@")[0] ?? ""}
                  name="display_name"
                />
              </label>
              <label className="space-y-2 text-sm font-medium md:col-span-2">
                {messages.dashboard.bio}
                <Textarea defaultValue={currentProfile?.bio ?? ""} name="bio" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.principle}
                <Input defaultValue={currentProfile?.principle ?? ""} name="principle" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.website}
                <Input
                  defaultValue={currentProfile?.website_url ?? ""}
                  name="website_url"
                  placeholder="https://curvio.org"
                  type="url"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-border-subtle pt-6">
          <div>
            <h2 className="text-xl font-medium">
              {messages.dashboard.profileLayoutTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {messages.dashboard.profileLayoutNote}
            </p>
          </div>
          <ProfileLayoutSorter
            labels={{
              visible: messages.dashboard.visible,
              dragHandle: messages.dashboard.dragHandle,
            }}
            sections={sections}
          />
        </section>

        <section className="space-y-4 border-t border-border-subtle pt-6">
          <h2 className="text-xl font-medium">{messages.dashboard.privacyTitle}</h2>
          <div className="grid gap-3">
            <label
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm"
            >
              {messages.dashboard.publicProfile}
              <input
                name="is_public"
                type="checkbox"
                defaultChecked={currentProfile?.is_public ?? true}
                className="h-5 w-5 rounded-md border border-border-subtle accent-primary"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
              {messages.dashboard.allowFollows}
              <input
                name="allow_follow"
                type="checkbox"
                defaultChecked={currentProfile?.allow_follow ?? true}
                className="h-5 w-5 rounded-md border border-border-subtle accent-primary"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
              {messages.dashboard.hideAmountsDefault}
              <input
                name="hide_amounts_by_default"
                type="checkbox"
                defaultChecked={currentProfile?.hide_amounts_by_default ?? true}
                className="h-5 w-5 rounded-md border border-border-subtle accent-primary"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm">
              {messages.dashboard.showAnnualSummary}
              <input
                name="show_annual_summary"
                type="checkbox"
                defaultChecked={currentProfile?.show_annual_summary ?? true}
                className="h-5 w-5 rounded-md border border-border-subtle accent-primary"
              />
            </label>
          </div>
        </section>
        <div className="border-t border-border-subtle pt-6">
          <Button type="submit">{messages.dashboard.saveSettings}</Button>
        </div>
        </Card>
      </form>
    </main>
  );
}
