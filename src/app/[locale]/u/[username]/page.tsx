import { Code2, Link as LinkIcon, MapPin } from "lucide-react";
import { Timeline } from "@/components/records/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { annualSummary, profile, records } from "@/lib/mock-data";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <section className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-container-high text-xl font-medium text-primary">
          {profile.avatarInitials}
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-muted">
                {profile.bio}
                <span className="mx-2">•</span>
                {profile.followingCount} Following
                <span className="mx-2">•</span>
                {profile.followerCount.toLocaleString()} Followers
              </p>
            </div>
            <Button variant="secondary">{messages.profile.follow}</Button>
          </div>
          <p className="mt-4 text-sm leading-6 text-on-surface-variant">
            {profile.principle}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </span>
            <a className="inline-flex items-center gap-1 hover:text-primary" href={profile.websiteUrl}>
              <LinkIcon className="h-4 w-4" />
              website.org
            </a>
            <a className="inline-flex items-center gap-1 hover:text-primary" href={profile.githubUrl}>
              <Code2 className="h-4 w-4" />
              github
            </a>
          </div>
        </div>
      </section>

      <div className="mt-12 flex gap-8 overflow-x-auto border-b border-border-subtle">
        {[
          messages.profile.donations,
          messages.profile.kindness,
          messages.profile.openWork,
          messages.profile.annualSummary,
        ].map((item, index) => (
          <button
            className={`pb-3 text-sm transition-colors ${
              index === 3
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-primary"
            }`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <Card className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {annualSummary.year} {messages.profile.annualSummary}
          </p>
          <div className="mt-3 text-6xl font-semibold text-primary">
            {annualSummary.totalRecords}
          </div>
          <p className="text-muted">{messages.profile.recordedActs}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{messages.profile.openWork}: {annualSummary.openSource}</Badge>
          <Badge>{messages.profile.donations}: {annualSummary.donations}</Badge>
          <Badge>{messages.profile.kindness}: {annualSummary.kindness}</Badge>
        </div>
      </Card>

      <section className="mt-14">
        <h2 className="mb-8 text-3xl font-medium">{messages.profile.publicLedger}</h2>
        <Timeline
          hiddenAmountLabel={messages.common.hiddenAmount}
          locale={locale}
          records={records}
          typeLabels={{
            donation: messages.common.recordDonation,
            kindness: messages.common.recordKindness,
            open_source: messages.common.recordOpenWork,
          }}
        />
      </section>
    </main>
  );
}
