import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/site/animated-section";
import { ButtonLink } from "@/components/ui/button";
import { PlatformCard } from "@/components/sections/platform-card";
import { StatsGrid } from "@/components/sections/stats-grid";
import { Timeline } from "@/components/records/timeline";
import { donationPlatforms, records } from "@/lib/mock-data";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

export function HomeSections({
  locale,
  messages,
}: {
  locale: Locale;
  messages: Record<string, string>;
}) {
  const stats = [
    { label: messages.statTotalRecords, value: records.length },
    { label: messages.statDonations, value: records.filter((record) => record.type === "donation").length },
    { label: messages.statKindnessActs, value: records.filter((record) => record.type === "kindness").length },
    {
      label: messages.statOpenWork,
      value: records.filter((record) => record.type === "open_source").length,
    },
    { label: messages.statMembers, value: 1 },
  ];

  return (
    <main className="pt-16">
      <section className="container-page flex min-h-[520px] flex-col items-center justify-center py-20 text-center">
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-6xl">
          {messages.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          {messages.heroLead}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={localizePath(locale, "/dashboard/new")}>
            {messages.start}
          </ButtonLink>
          <ButtonLink href={localizePath(locale, "/explore")} variant="secondary">
            {messages.exploreRecords}
          </ButtonLink>
        </div>
      </section>

      <AnimatedSection className="container-narrow pb-20">
        <div className="rounded-2xl border border-[#f0ebe1] bg-[#fdfbf6] p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.03)] md:p-10">
          <p className="text-lg italic leading-8 text-foreground">
            “{messages.founderNote}”
          </p>
          <div className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            {messages.founder}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="container-page pb-20">
        <StatsGrid stats={stats} />
      </AnimatedSection>

      <AnimatedSection className="container-narrow pb-20">
        <div className="mb-8 border-b border-border-subtle pb-4">
          <h2 className="text-3xl font-medium">{messages.recent}</h2>
        </div>
        <Timeline
          hiddenAmountLabel={messages.hiddenAmount}
          locale={locale}
          records={records.slice(0, 3)}
          typeLabels={{
            donation: messages.recordDonation,
            kindness: messages.recordKindness,
            open_source: messages.recordOpenWork,
          }}
        />
        <div className="mt-8 text-center">
          <ButtonLink href={localizePath(locale, "/explore")} variant="ghost">
            {messages.exploreRecords}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </AnimatedSection>

      <AnimatedSection className="container-page pb-20">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl font-medium">{messages.platforms}</h2>
          <p className="mt-3 leading-7 text-muted">{messages.platformLead}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {donationPlatforms.slice(0, 3).map((platform) => (
            <PlatformCard
              key={platform.id}
              locale={locale}
              platform={platform}
              visitLabel={messages.visitOfficial}
            />
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="container-narrow pb-24 text-center">
        <h2 className="text-2xl font-medium">{messages.whyTitle}</h2>
        <p className="mt-4 leading-7 text-muted">{messages.whyBody}</p>
      </AnimatedSection>
    </main>
  );
}
