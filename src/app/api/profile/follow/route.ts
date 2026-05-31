import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, action } = body as { username: string; action: "follow" | "unfollow" };

    if (!username || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, username, allow_follow")
      .eq("username", username)
      .maybeSingle();

    if (!targetProfile || targetProfile.id === user.id || (action === "follow" && !targetProfile.allow_follow)) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    if (action === "follow") {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetProfile.id });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // unfollow
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetProfile.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? String(err) }, { status: 500 });
  }
}
