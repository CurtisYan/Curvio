"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RecordCard } from "@/components/records/record-card";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import type { GoodwillRecord } from "@/lib/types";

type SocialProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
};

type ActiveTab = "donations" | "kindness" | "open_source" | "annual_summary" | "following" | "followers";

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
    donations: string;
    kindness: string;
    openWork: string;
    annualSummary: string;
    following: string;
    followers: string;
    publicLedger: string;
    recordedActs: string;
    hiddenAmount: string;
    recordDonation: string;
    recordKindness: string;
    recordOpenWork: string;
    by: string;
    anonymous: string;
    emptyFollowing: string;
    emptyFollowers: string;
  };
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("annual_summary");

  useEffect(() => {
    const setFromHash = () => {
      try {
        const hash = (window.location.hash || "").replace("#", "");
        if (
          hash === "following" ||
          hash === "followers" ||
          hash === "donations" ||
          hash === "kindness" ||
          hash === "open_source" ||
          hash === "annual_summary"
        ) {
          setActiveTab(hash as ActiveTab);
        }
      } catch (e) {
        // ignore
      }
    };

    setFromHash();
    window.addEventListener("hashchange", setFromHash);
    return () => window.removeEventListener("hashchange", setFromHash);
  }, []);

  useEffect(() => {
    try {
      if (activeTab === "following" || activeTab === "followers") {
        window.history.replaceState(null, "", `#${activeTab}`);
      } else {
        window.history.replaceState(null, "", `#`);
      }
    } catch (e) {
      // ignore
    }
  }, [activeTab]);

  return (
    <section className="mt-12 space-y-8">
      <div className="flex flex-wrap gap-3">
        {[
          { key: "donations", label: labels.donations },
          { key: "kindness", label: labels.kindness },
          { key: "open_source", label: labels.openWork },
          { key: "annual_summary", label: labels.annualSummary },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              activeTab === tab.key
                ? "border-surface-container-high bg-surface-container-high text-foreground"
                : "border-border-subtle bg-surface-offwhite text-muted hover:bg-surface-container-low hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("following")}
          className="text-sm text-muted transition-opacity hover:text-primary hover:opacity-90"
          title={locale === "zh" ? "点击查看已关注列表" : "Click to view following list"}
        >
          {labels.following} ({following.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("followers")}
          className="text-sm text-muted transition-opacity hover:text-primary hover:opacity-90"
          title={locale === "zh" ? "点击查看粉丝列表" : "Click to view followers list"}
        >
          {labels.followers} ({followers.length})
        </button>
      </div>

          {activeTab === "donations" && (
            <div className="space-y-6">
              {records.donations.length === 0 ? (
                <div className="text-muted">{labels.emptyDonations}</div>
              ) : (
                records.donations.map((r) => <RecordCard key={r.id} record={r} />)
              )}
            </div>
          )}
          {activeTab === "kindness" && (
            <div className="space-y-6">
              {records.kindness.length === 0 ? (
                <div className="text-muted">{labels.emptyKindness}</div>
              ) : (
                records.kindness.map((r) => <RecordCard key={r.id} record={r} />)
              )}
            </div>
          )}
          {activeTab === "open_source" && (
            <div className="space-y-6">
              {records.open_source.length === 0 ? (
                <div className="text-muted">{labels.emptyOpenWork}</div>
              ) : (
                records.open_source.map((r) => <RecordCard key={r.id} record={r} />)
              )}
            </div>
          )}
          {activeTab === "annual_summary" && (
            <div className="space-y-6">
              {(!annualSummary || (Array.isArray(annualSummary) && annualSummary.length === 0)) ? (
                <div className="text-muted">{labels.emptyAnnualSummary}</div>
              ) : Array.isArray(annualSummary) ? (
                annualSummary.map((r) => <RecordCard key={r.id} record={r} />)
              ) : (
                <Card className="p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{labels.annualSummary} — {annualSummary.year}</h3>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="text-sm text-muted">{labels.recordedActs}: <span className="text-foreground font-medium">{annualSummary.totalRecords}</span></div>
                      <div className="text-sm text-muted">{labels.recordDonation}: <span className="text-foreground font-medium">{annualSummary.donations}</span></div>
                      <div className="text-sm text-muted">{labels.recordKindness}: <span className="text-foreground font-medium">{annualSummary.kindness}</span></div>
                      <div className="text-sm text-muted">{labels.recordOpenWork}: <span className="text-foreground font-medium">{annualSummary.openSource}</span></div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
          {activeTab === "following" && (
            <div id="following" className="space-y-4 scroll-mt-24">
              {following.length === 0 ? (
                <div className="text-muted">{labels.emptyFollowing}</div>
              ) : (
                following.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${locale}/u/${p.username}`}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-high text-sm font-medium text-primary">
                      <SocialAvatar name={p.display_name || p.username} url={p.avatar_url} />
                    </span>
                    <div>
                      <div className="font-medium">{p.display_name || p.username}</div>
                      <div className="text-muted text-sm">@{p.username}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
          {activeTab === "followers" && (
            <div id="followers" className="space-y-4 scroll-mt-24">
              {followers.length === 0 ? (
                <div className="text-muted">{labels.emptyFollowers}</div>
              ) : (
                followers.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${locale}/u/${p.username}`}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-high text-sm font-medium text-primary">
                      <SocialAvatar name={p.display_name || p.username} url={p.avatar_url} />
                    </span>
                    <div>
                      <div className="font-medium">{p.display_name || p.username}</div>
                      <div className="text-muted text-sm">@{p.username}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </section>
    );
}