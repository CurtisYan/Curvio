import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { records } from "@/lib/mock-data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const projects = records.filter((record) => record.type === "open_source");

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <DashboardNav locale={locale} labels={messages.dashboard} />
      <div className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          {messages.dashboard.projects}
        </h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <h2 className="text-2xl font-medium">{project.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{project.content}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
              <Badge>Free</Badge>
              <Badge>Open source</Badge>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
