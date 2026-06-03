import { Code2, Link as LinkIcon, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { ProfileContentSwitcher } from "@/components/site/profile-content-switcher";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";
import FollowButton from "@/components/site/follow-button";
import { surfaceHover } from "@/components/ui/interactive";
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

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  principle: string | null;
  location: string | null;
  website_url: string | null;
  github_url: string | null;
  allow_follow: boolean;
  is_public: boolean;
  is_following?: boolean | null;
};

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

  // fetch profile and whether current viewer follows in one RPC
  const { data: profileRpc } = await supabase.rpc(
    "get_profile_with_follow_status",
    { viewer_uuid: user ? user.id : null, username_text: username },
  );

  let profile: Profile | null =
    Array.isArray(profileRpc) && profileRpc.length > 0 ? (profileRpc[0] as Profile) : null;

  if (!profile) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, principle, location, website_url, github_url, allow_follow, is_public")
      .eq("username", username)
      .maybeSingle();

    if (profileRow) {
      let isFollowing = false;

      if (user) {
        const { data: followRow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profileRow.id)
          .maybeSingle();

        isFollowing = Boolean(followRow);
      }

      profile = { ...profileRow, is_following: isFollowing };
    }
  }

  const isOwnProfile = user?.id === profile?.id;

  if (!profile || (!profile.is_public && !isOwnProfile)) {
    notFound();
  }

  const recordsQuery = supabase
    .from("records")
    .select(
      "id, type, title, content, date, is_anonymous, amount, show_amount, organization_name, platform_name, project_url, tags, language, archived_at, record_images(id, r2_url, sort_order, is_cover, visibility)",
    )
    .eq("user_id", profile.id)
    .is("archived_at", null)
    .order("date", { ascending: false });

  if (!isOwnProfile) {
    recordsQuery.eq("is_public", true);
  }

  const [{ count: followingCount }, { count: followerCount }, { data: followingRows }, { data: followerRows }, { data: recordRows }] = await Promise.all([
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profile?.id),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profile?.id),
    supabase.from("follows").select("following_id").eq("follower_id", profile?.id),
    supabase.from("follows").select("follower_id").eq("following_id", profile?.id),
    recordsQuery,
  ]);

  const isFollowing = Boolean(profile?.is_following);

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
    images: (record.record_images ?? [])
      .filter((image) => isOwnProfile || image.visibility === "public")
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((image) => ({
        id: image.id,
        url: image.r2_url,
        isCover: image.is_cover,
      })),
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
              <p className="mt-1 text-sm text-muted">@{profile.username}</p>
              <p className="mt-2 text-muted">
                {(profile.bio ?? "").trim() ? profile.bio : profile.principle}
                <span className="mx-2">·</span>
                <a
                  href="#following"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${surfaceHover}`}
                  title={locale === "zh" ? "点击查看已关注列表" : "Click to view following list"}
                >
                  {followingCount ?? 0} {messages.profile.following}
                </a>
                <span className="mx-2">·</span>
                <a
                  href="#followers"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${surfaceHover}`}
                  title={locale === "zh" ? "点击查看粉丝列表" : "Click to view followers list"}
                >
                  {(followerCount ?? 0).toLocaleString()} {messages.profile.followers}
                </a>
              </p>
            </div>
            {isOwnProfile ? (
              <ButtonLink href={localizePath(locale, "/settings")} variant="secondary">
                {messages.profile.edit}
              </ButtonLink>
            ) : (
              <FollowButton
                initialIsFollowing={isFollowing}
                locale={locale}
                username={profile.username}
                labels={{ follow: messages.profile.follow, following: messages.profile.following }}
              />
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
          activity: messages.profile.activity,
          annualSummary: messages.profile.annualSummary,
          anonymous: messages.common.anonymous,
          by: messages.common.by,
          donations: messages.profile.donations,
          emptyAnnualSummary: messages.profile.emptyAnnualSummary,
          emptyActivity: messages.profile.emptyActivity,
          emptyDonations: messages.profile.emptyDonations,
          emptyFollowers: messages.profile.emptyFollowers,
          emptyFollowing: messages.profile.emptyFollowing,
          emptyKindness: messages.profile.emptyKindness,
          emptyOpenWork: messages.profile.emptyOpenWork,
          followers: messages.profile.followers,
          following: messages.profile.following,
          kindness: messages.profile.kindness,
          openWork: messages.profile.openWork,
          recordDonation: messages.common.recordDonation,
          recordKindness: messages.common.recordKindness,
          recordOpenWork: messages.common.recordOpenWork,
          recordedActs: messages.profile.recordedActs,
          statistics: messages.profile.statistics,
        }}
        locale={locale}
        records={recordsByType}
      />
    </main>
  );
}

