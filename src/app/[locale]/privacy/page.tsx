import { Shield, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <header>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          Curvio
        </p>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight">
          {messages.privacy.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">{messages.privacy.lead}</p>
      </header>

      <section className="mt-12 grid gap-4">
        <Card>
          <div className="flex gap-4">
            <Shield className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.purposeTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.purposeBody}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <Eye className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.scopeTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.scopeBody}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <Trash2 className="mt-1 h-5 w-5 shrink-0 text-tertiary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.deleteTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.deleteBody}</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
