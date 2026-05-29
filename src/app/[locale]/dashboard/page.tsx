import { ArrowRight, Code2, FilePlus2, ListChecks, Settings } from "lucide-react";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const items = [
    { href: "/dashboard/new", label: messages.dashboard.newRecord, icon: FilePlus2 },
    { href: "/dashboard/records", label: messages.dashboard.records, icon: ListChecks },
    { href: "/dashboard/projects", label: messages.dashboard.projects, icon: Code2 },
    { href: "/dashboard/settings", label: messages.dashboard.settings, icon: Settings },
  ];

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight">{messages.dashboard.title}</h1>
        <p className="mt-3 text-lg leading-8 text-muted">{messages.dashboard.lead}</p>
      </div>
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={localizePath(locale, item.href)} key={item.href}>
              <Card className="group min-h-44">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-6 text-2xl font-medium">{item.label}</h2>
                <ArrowRight className="mt-5 h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
