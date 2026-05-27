import { CheckCircle2, Shield, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  const principles = [
    messages.about.principleOne,
    messages.about.principleTwo,
    messages.about.principleThree,
  ];

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <header>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          Curvio
        </p>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight">
          {messages.about.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">{messages.about.lead}</p>
      </header>

      <section className="mt-12 grid gap-4">
        <Card>
          <div className="flex gap-4">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.about.principles}</h2>
              <div className="mt-5 space-y-3">
                {principles.map((principle) => (
                  <p className="flex items-center gap-3 text-muted" key={principle}>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {principle}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex gap-4">
            <Shield className="mt-1 h-5 w-5 shrink-0 text-tertiary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.about.boundaryTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.about.boundaryBody}</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
