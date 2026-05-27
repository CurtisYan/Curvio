import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

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
      </Card>
    </main>
  );
}
