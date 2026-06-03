"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RecordCard } from "@/components/records/record-card";
import { Card } from "@/components/ui/card";
import { localizePath, type Locale } from "@/lib/i18n";
import { formatRecordPublicId } from "@/lib/record-public-id";
import { recordTypeToSegment } from "@/lib/record-types";
import type { GoodwillRecord } from "@/lib/types";

type SocialProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
};

type ActiveTab = "activity" | "donations" | "kindness" | "open_source" | "statistics" | "following" | "followers";

function initialsFrom(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function SocialAvatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return <img alt={name} className="h-full w-full object-cover" loading="lazy" src={url} />;
  }

  return <span>{initialsFrom(name)}</span>;
}

export function ProfileContentSwitcher({
  locale,
  records,
  annualSummary,
  following,
  followers,
  labels,
}: {
  locale: Locale;
  records: {
    donations: GoodwillRecord[];
    kindness: GoodwillRecord[];
    open_source: GoodwillRecord[];
  };
  annualSummary: {
    year: number;
    totalRecords: number;
    donations: number;
    kindness: number;
    openSource: number;
  };
  following: SocialProfile[];
  followers: SocialProfile[];
  labels: {
    activity: string;
    donations: string;
    kindness: string;
    openWork: string;
    statistics: string;
    annualSummary: string;
    following: string;
    followers: string;
    recordedActs: string;
    recordDonation: string;
    recordKindness: string;
    recordOpenWork: string;
    by: string;
    anonymous: string;
    emptyDonations: string;
    emptyKindness: string;
    emptyOpenWork: string;
    emptyAnnualSummary: string;
    emptyFollowing: string;
    emptyFollowers: string;
    emptyActivity: string;
  };
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("activity");
  const typeLabels = {
    donation: labels.recordDonation,
    kindness: labels.recordKindness,
    open_source: labels.recordOpenWork,
  };
  const allRecords = [...records.donations, ...records.kindness, ...records.open_source].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const recordsByYear = allRecords.reduce<Record<string, GoodwillRecord[]>>((groups, record) => {
    const year = String(new Date(record.date).getFullYear());
    groups[year] = [...(groups[year] ?? []), record];
    return groups;
  }, {});

  useEffect(() => {
    const setFromHash = () => {
      const hash = (window.location.hash || "").replace("#", "");
      if (
        hash === "activity" ||
        hash === "following" ||
        hash === "followers" ||
        hash === "donations" ||
        hash === "kindness" ||
        hash === "open_source" ||
        hash === "statistics"
      ) {
        setActiveTab(hash as ActiveTab);
      }
    };

    setFromHash();
    window.addEventListener("hashchange", setFromHash);
    return () => window.removeEventListener("hashchange", setFromHash);
  }, []);

  useEffect(() => {
    if (activeTab === "activity") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }

    window.history.replaceState(null, "", `#${activeTab}`);
  }, [activeTab]);

  const tabClass = (tab: ActiveTab) =>
    `rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === tab
        ? "border-primary bg-primary text-white shadow-sm"
        : "border-border-subtle bg-surface-offwhite text-muted hover:bg-surface-container-low hover:text-primary"
    }`;

  const socialTabClass = (tab: ActiveTab) =>
    `rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
      activeTab === tab
        ? "border-primary bg-primary text-white shadow-sm"
        : "border-transparent text-muted hover:border-border-subtle hover:bg-surface-container-low hover:text-primary"
    }`;

  const renderRecords = (items: GoodwillRecord[], emptyLabel: string) => (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="text-muted">{emptyLabel}</div>
      ) : (
        items.map((record) => (
          <RecordCard
            anonymousLabel={labels.anonymous}
            key={record.id}
            locale={locale}
            record={record}
            typeLabels={typeLabels}
          />
        ))
      )}
    </div>
  );

  return (
    <section className="mt-12 space-y-8">
      <div className="flex flex-wrap gap-3">
        {[
          { key: "activity", label: labels.activity },
          { key: "donations", label: labels.donations },
          { key: "kindness", label: labels.kindness },
          { key: "open_source", label: labels.openWork },
          { key: "statistics", label: labels.statistics },
        ].map((tab) => (
          <button
            className={tabClass(tab.key as ActiveTab)}
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          className={socialTabClass("following")}
          onClick={() => setActiveTab("following")}
          title={locale === "zh" ? "点击查看已关注列表" : "Click to view following list"}
          type="button"
        >
          {labels.following} ({following.length})
        </button>
        <button
          className={socialTabClass("followers")}
          onClick={() => setActiveTab("followers")}
          title={locale === "zh" ? "点击查看粉丝列表" : "Click to view followers list"}
          type="button"
        >
          {labels.followers} ({followers.length})
        </button>
      </div>

      {activeTab === "activity" ? (
        <div className="space-y-6">
          {allRecords.length === 0 ? (
            <div className="text-muted">{labels.emptyActivity}</div>
          ) : (
            Object.entries(recordsByYear).map(([year, yearRecords], index) => (
              <details className="group" key={year} open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-3 py-2 text-lg font-semibold marker:hidden">
                  <span>{year}</span>
                  <span className="text-xs font-normal text-muted group-open:hidden">
                    {locale === "zh" ? "展开" : "Expand"}
                  </span>
                  <span className="hidden text-xs font-normal text-muted group-open:inline">
                    {locale === "zh" ? "收起" : "Collapse"}
                  </span>
                </summary>
                <div className="relative ml-3 mt-3 space-y-5 border-l border-border-subtle pl-6">
                  {yearRecords.map((record) => (
                    <Link
                      className="group/item relative block rounded-lg px-3 py-2 transition-colors hover:bg-surface-container-low"
                      href={localizePath(
                        locale,
                        `/u/${record.authorUsername}/${recordTypeToSegment(record.type)}/${formatRecordPublicId(record.date, record.id)}`,
                      )}
                      key={record.id}
                    >
                      <span className="absolute -left-[29px] mt-2 h-2.5 w-2.5 rounded-full border border-primary bg-surface-offwhite" />
                      <div className="flex flex-wrap items-center gap-3">
                        <time className="text-sm text-muted">
                          {new Intl.DateTimeFormat(locale, {
                            month: "long",
                            day: "numeric",
                          }).format(new Date(record.date))}
                        </time>
                        <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-xs text-muted">
                          {typeLabels[record.type]}
                        </span>
                      </div>
                      <div className="mt-1 font-medium text-foreground group-hover/item:text-primary">
                        {record.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      ) : null}

      {activeTab === "donations" ? renderRecords(records.donations, labels.emptyDonations) : null}
      {activeTab === "kindness" ? renderRecords(records.kindness, labels.emptyKindness) : null}
      {activeTab === "open_source" ? renderRecords(records.open_source, labels.emptyOpenWork) : null}

      {activeTab === "statistics" ? (
        <div className="space-y-6">
          {!annualSummary ? (
            <div className="text-muted">{labels.emptyAnnualSummary}</div>
          ) : (
            <Card className="p-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {labels.annualSummary} - {annualSummary.year}
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="text-sm text-muted">
                    {labels.recordedActs}: <span className="font-medium text-foreground">{annualSummary.totalRecords}</span>
                  </div>
                  <div className="text-sm text-muted">
                    {labels.recordDonation}: <span className="font-medium text-foreground">{annualSummary.donations}</span>
                  </div>
                  <div className="text-sm text-muted">
                    {labels.recordKindness}: <span className="font-medium text-foreground">{annualSummary.kindness}</span>
                  </div>
                  <div className="text-sm text-muted">
                    {labels.recordOpenWork}: <span className="font-medium text-foreground">{annualSummary.openSource}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : null}

      {activeTab === "following" ? (
        <div className="space-y-4 scroll-mt-24" id="following">
          {following.length === 0 ? (
            <div className="text-muted">{labels.emptyFollowing}</div>
          ) : (
            following.map((profile) => (
              <SocialProfileLink key={profile.id} locale={locale} profile={profile} />
            ))
          )}
        </div>
      ) : null}

      {activeTab === "followers" ? (
        <div className="space-y-4 scroll-mt-24" id="followers">
          {followers.length === 0 ? (
            <div className="text-muted">{labels.emptyFollowers}</div>
          ) : (
            followers.map((profile) => (
              <SocialProfileLink key={profile.id} locale={locale} profile={profile} />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}

function SocialProfileLink({
  locale,
  profile,
}: {
  locale: Locale;
  profile: SocialProfile;
}) {
  const name = profile.display_name || profile.username;

  return (
    <Link
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-container-low"
      href={`/${locale}/u/${profile.username}`}
    >
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-high text-sm font-medium text-primary">
        <SocialAvatar name={name} url={profile.avatar_url} />
      </span>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted">@{profile.username}</div>
      </div>
    </Link>
  );
}
