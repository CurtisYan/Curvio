import { Code2, Link as LinkIcon, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileContentSwitcher } from "@/components/site/profile-content-switcher";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";
import { followProfileAction, unfollowProfileAction } from "@/app/dashboard-actions";
import type { GoodwillRecord } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

function hostnameFromUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

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

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: rawLocale, username } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: viewerProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, principle, location, website_url, github_url, allow_follow, is_public",
      )
      .eq("username", username)
      .maybeSingle(),
    user
      ? supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null as { username: string } | null }),
  ]);

  if (!profile || (!profile.is_public && viewerProfile?.username !== profile.username)) {
    notFound();
  }

  const isOwnProfile = viewerProfile?.username === profile.username;

  const recordsQuery = supabase
    .from("records")
    .select(
      "id, type, title, content, date, is_anonymous, amount, show_amount, organization_name, platform_name, project_url, tags, language",
    )
    .eq("user_id", profile.id)
    .order("date", { ascending: false });

  if (!isOwnProfile) {
    recordsQuery.eq("is_public", true);
  }

  const followingStatusPromise = user && !isOwnProfile
    ? supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", profile.id)
        .maybeSingle()
    : Promise.resolve({ data: null as { id: string } | null });

  const [{ data: followingStatus }, { count: followingCount }, { count: followerCount }, { data: followingRows }, { data: followerRows }, { data: recordRows }] = await Promise.all([
    followingStatusPromise,
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("following_id").eq("follower_id", profile.id),
    supabase.from("follows").select("follower_id").eq("following_id", profile.id),
    recordsQuery,
  ]);

  const isFollowing = Boolean(followingStatus);

  const followingIds = (followingRows ?? []).map((row) => row.following_id);
  const followerIds = (followerRows ?? []).map((row) => row.follower_id);

  const [{ data: followingProfiles }, { data: followerProfiles }] = await Promise.all([
    followingIds.length
      ? supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", followingIds)
      : Promise.resolve({ data: [] as Array<{ id: string; username: string; display_name: string; avatar_url: string | null }> }),
    followerIds.length
      ? supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", followerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; username: string; display_name: string; avatar_url: string | null }> }),
  ]);

  const records: GoodwillRecord[] = (recordRows ?? []).map((record) => ({
    id: record.id,
    type: record.type,
    title: record.title,
    content: record.content,
    date: record.date,
    authorUsername: profile.username,
    authorDisplayName: profile.display_name,
    isAnonymous: record.is_anonymous,
    amountHidden: Boolean(record.amount) && !record.show_amount,
    organizationName: record.organization_name ?? undefined,
    platformName: record.platform_name ?? undefined,
    projectUrl: record.project_url ?? undefined,
    tags: record.tags ?? [],
    language: record.language,
  }));

  const currentYear = new Date().getFullYear();
  const annualRecords = records.filter(
    (record) => new Date(record.date).getFullYear() === currentYear,
  );
  const annualSummary = {
    year: currentYear,
    totalRecords: annualRecords.length,
    donations: annualRecords.filter((record) => record.type === "donation").length,
    kindness: annualRecords.filter((record) => record.type === "kindness").length,
    openSource: annualRecords.filter((record) => record.type === "open_source").length,
  };
  const profileInitials = profile.avatar_url ? null : initialsFrom(profile.display_name);

  const recordsByType = {
    donations: records.filter((record) => record.type === "donation"),
    kindness: records.filter((record) => record.type === "kindness"),
    open_source: records.filter((record) => record.type === "open_source"),
  };

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <section className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-high text-xl font-medium text-primary">
          {profile.avatar_url ? (
            <img alt={profile.display_name} className="h-full w-full object-cover" loading="lazy" src={profile.avatar_url} />
          ) : (
            profileInitials
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{profile.display_name}</h1>
              <p className="mt-2 text-muted">
                {(profile.bio ?? "").trim() ? profile.bio : profile.principle}
                <span className="mx-2">•</span>
                <a
                  href="#following"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-surface-container-low hover:text-primary"
                  title={locale === "zh" ? "点击查看已关注列表" : "Click to view following list"}
                >
                  {followingCount ?? 0} {messages.profile.following}
                </a>
                <span className="mx-2">•</span>
                <a
                  href="#followers"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-surface-container-low hover:text-primary"
                  title={locale === "zh" ? "点击查看粉丝列表" : "Click to view followers list"}
                >
                  {(followerCount ?? 0).toLocaleString()} {messages.profile.followers}
                </a>
              </p>
            </div>
            {isOwnProfile ? (
              <ButtonLink href={localizePath(locale, "/settings")} variant="secondary">
                {messages.dashboard.settings}
              </ButtonLink>
            ) : isFollowing ? (
              <form action={unfollowProfileAction} className="m-0">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="username" value={profile.username} />
                <Button type="submit" variant="secondary" title={locale === "zh" ? "取消关注" : "Unfollow this profile"}>
                  {messages.profile.following}
                </Button>
              </form>
            ) : (
              <form action={followProfileAction} className="m-0">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="username" value={profile.username} />
                <Button type="submit" variant="primary" title={locale === "zh" ? "关注此用户" : "Follow this profile"}>
                  {messages.profile.follow}
                </Button>
              </form>
            )}
          </div>
          {profile.principle ? (
            <p className="mt-4 text-sm leading-6 text-on-surface-variant">{profile.principle}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            {profile.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            ) : null}
            {profile.website_url ? (
              <a className="inline-flex items-center gap-1 hover:text-primary" href={profile.website_url} rel="noreferrer" target="_blank">
                <LinkIcon className="h-4 w-4" />
                {hostnameFromUrl(profile.website_url) ?? profile.website_url}
              </a>
            ) : null}
            {profile.github_url ? (
              <a className="inline-flex items-center gap-1 hover:text-primary" href={profile.github_url} rel="noreferrer" target="_blank">
                <Code2 className="h-4 w-4" />
                {hostnameFromUrl(profile.github_url) ?? "github"}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <ProfileContentSwitcher
        annualSummary={annualSummary}
        followers={(followerProfiles ?? []) as Array<{ id: string; username: string; display_name: string; avatar_url?: string | null }>}
        following={(followingProfiles ?? []) as Array<{ id: string; username: string; display_name: string; avatar_url?: string | null }>}
        labels={{
          annualSummary: messages.profile.annualSummary,
          anonymous: messages.common.anonymous,
          by: messages.common.by,
          donations: messages.profile.donations,
          emptyFollowers: messages.profile.emptyFollowers,
          emptyFollowing: messages.profile.emptyFollowing,
          followers: messages.profile.followers,
          following: messages.profile.following,
          hiddenAmount: messages.common.hiddenAmount,
          kindness: messages.profile.kindness,
          openWork: messages.profile.openWork,
          publicLedger: messages.profile.publicLedger,
          recordDonation: messages.common.recordDonation,
          recordKindness: messages.common.recordKindness,
          recordOpenWork: messages.common.recordOpenWork,
          recordedActs: messages.profile.recordedActs,
        }}
        locale={locale}
        records={recordsByType}
      />
    </main>
  );
}
