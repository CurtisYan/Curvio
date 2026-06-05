"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Layers3, ListChecks, TrendingUp } from "lucide-react";
import Link from "next/link";
import { RecordCard } from "@/components/records/record-card";
import { RecordTypeBadge } from "@/components/records/record-type-badge";
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
    activeMonths: number;
    firstRecordDate: string | null;
    latestRecordDate: string | null;
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
  const summaryLabels =
    locale === "zh"
      ? {
          activeMonths: "活跃月份",
          firstRecord: "年度首条",
          latestRecord: "最近记录",
          noDate: "暂无",
          primaryType: "主要类型",
          quietYear: "今年还没有公开记录",
          timeline: "年度节奏",
          total: "全年记录",
        }
      : {
          activeMonths: "Active months",
          firstRecord: "First record",
          latestRecord: "Latest record",
          noDate: "None yet",
          primaryType: "Primary type",
          quietYear: "No public records this year",
          timeline: "Yearly rhythm",
          total: "Year records",
        };
  const annualBreakdown = [
    { label: labels.recordDonation, value: annualSummary.donations, tone: "bg-primary" },
    { label: labels.recordKindness, value: annualSummary.kindness, tone: "bg-tertiary" },
    { label: labels.recordOpenWork, value: annualSummary.openSource, tone: "bg-secondary" },
  ];
  const primaryAnnualType = annualBreakdown.reduce(
    (best, item) => (item.value > best.value ? item : best),
    annualBreakdown[0],
  );
  const formatSummaryDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
        }).format(new Date(value))
      : summaryLabels.noDate;

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
            hiddenAmountLabel={locale === "zh" ? "金额已隐藏" : "Hidden amount"}
            key={record.id}
            locale={locale}
            privateAmountLabel={locale === "zh" ? "他人不可见" : "Hidden from others"}
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
                <summary className="flex cursor-pointer select-none list-none items-center gap-3 py-2 text-lg font-semibold marker:hidden">
                  <span className="select-none">{year}</span>
                  <span className="sr-only">
                    {locale === "zh" ? "切换年份动态" : "Toggle yearly activity"}
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
                        <RecordTypeBadge label={typeLabels[record.type]} type={record.type} />
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
          {!annualSummary || annualSummary.totalRecords === 0 ? (
            <div className="text-muted">{labels.emptyAnnualSummary}</div>
          ) : (
            <Card className="overflow-hidden rounded-lg p-0">
              <div className="border-b border-border-subtle bg-surface-container-low px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase text-muted">
                  {labels.annualSummary}
                </p>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-foreground">
                    {annualSummary.year}
                  </h3>
                  <span className="rounded-full border border-border-subtle bg-surface-offwhite px-3 py-1 text-xs font-medium text-on-surface-variant">
                    {summaryLabels.timeline}
                  </span>
                </div>
              </div>

              <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
                <div className="border-b border-border-subtle p-5 md:border-r md:border-b-0 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted">{summaryLabels.total}</div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-5xl font-semibold leading-none tracking-normal text-foreground">
                          {annualSummary.totalRecords}
                        </span>
                        <span className="text-sm text-muted">{labels.recordedActs}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {annualBreakdown.map((item) => {
                      const percent =
                        annualSummary.totalRecords > 0
                          ? Math.round((item.value / annualSummary.totalRecords) * 100)
                          : 0;

                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-on-surface-variant">{item.label}</span>
                            <span className="text-muted">
                              {item.value} · {percent}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                            <div
                              className={`h-full rounded-full ${item.tone}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-border-subtle sm:grid-cols-2 md:grid-cols-1">
                  {[
                    {
                      icon: CalendarDays,
                      label: summaryLabels.activeMonths,
                      value: `${annualSummary.activeMonths}/12`,
                    },
                    {
                      icon: Layers3,
                      label: summaryLabels.primaryType,
                      value: primaryAnnualType.value > 0 ? primaryAnnualType.label : summaryLabels.quietYear,
                    },
                    {
                      icon: TrendingUp,
                      label: summaryLabels.latestRecord,
                      value: formatSummaryDate(annualSummary.latestRecordDate),
                    },
                    {
                      icon: CalendarDays,
                      label: summaryLabels.firstRecord,
                      value: formatSummaryDate(annualSummary.firstRecordDate),
                    },
                  ].map((item) => (
                    <div className="bg-surface-offwhite p-5" key={item.label}>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <div className="mt-2 text-lg font-semibold leading-snug text-foreground">
                        {item.value}
                      </div>
                    </div>
                  ))}
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
