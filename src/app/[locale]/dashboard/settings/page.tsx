import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProfileLayoutSorter } from "@/components/dashboard/profile-layout-sorter";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { profile } from "@/lib/mock-data";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const settings = [
    messages.dashboard.publicProfile,
    messages.dashboard.allowFollows,
    messages.dashboard.hideAmountsDefault,
    messages.dashboard.showAnnualSummary,
  ];
  const sections = [
    { id: "donations", label: messages.dashboard.sectionDonations },
    { id: "projects", label: messages.dashboard.sectionProjects },
    { id: "kindness", label: messages.dashboard.sectionKindness },
    { id: "annual", label: messages.dashboard.sectionAnnual },
  ];

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <Card className="mt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {messages.dashboard.settingsTitle}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {messages.dashboard.comingSoon}
          </p>
        </div>

        <section className="space-y-4 border-t border-border-subtle pt-6">
          <h2 className="text-xl font-medium">
            {messages.dashboard.profileSettingsTitle}
          </h2>
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-container-high text-xl font-medium text-primary">
              {profile.avatarInitials}
            </div>
            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.displayName}
                <Input defaultValue={profile.displayName} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.avatar}
                <Input placeholder="https://..." />
              </label>
              <label className="space-y-2 text-sm font-medium md:col-span-2">
                {messages.dashboard.bio}
                <Textarea defaultValue={profile.bio} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.principle}
                <Input defaultValue={profile.principle} />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {messages.dashboard.website}
                <Input defaultValue={profile.websiteUrl} />
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
          {settings.map((setting, index) => (
            <label
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-container-low p-4 text-sm"
              key={setting}
            >
              {setting}
              <input type="checkbox" defaultChecked={index !== 3} />
            </label>
          ))}
        </div>
        </section>
      </Card>
    </main>
  );
}
