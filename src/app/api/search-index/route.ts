import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [profilesResult, recordsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("is_public", true)
        .order("updated_at", { ascending: false }),
      supabase
        .from("records")
        .select(
          "id, type, title, content, reflection, date, is_anonymous, organization_name, platform_name, tags, profiles(username, display_name, avatar_url)",
        )
        .eq("is_public", true)
        .is("archived_at", null)
        .order("date", { ascending: false }),
    ]);

    if (profilesResult.error) {
      return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
    }

    if (recordsResult.error) {
      return NextResponse.json({ error: recordsResult.error.message }, { status: 500 });
    }

    const users = (profilesResult.data ?? []).map((profile) => ({
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
    }));

    const records = (recordsResult.data ?? []).map((record) => {
      const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;

      return {
        id: record.id,
        type: record.type,
        title: record.title,
        content: record.content,
        reflection: record.reflection ?? null,
        date: record.date,
        authorUsername: profile?.username ?? "anonymous",
        authorDisplayName: profile?.display_name ?? profile?.username ?? "Anonymous",
        authorAvatarUrl: profile?.avatar_url ?? null,
        isAnonymous: record.is_anonymous,
        organizationName: record.organization_name ?? null,
        platformName: record.platform_name ?? null,
        tags: record.tags ?? [],
      };
    });

    return NextResponse.json({ users, records });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
