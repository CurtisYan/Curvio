"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { uploadAvatarToR2 } from "@/utils/r2";
import { createClient } from "@/utils/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readLocale(formData: FormData): Locale {
  const locale = readString(formData, "locale");
  return isLocale(locale) ? locale : "en";
}

function redirectWithStatus(locale: Locale, status: "saved" | "error", message?: string): never {
  const params = new URLSearchParams({ status });
  if (message) {
    params.set("message", message);
  }
  redirect(`/${locale}/dashboard/settings?${params.toString()}`);
}

function normalizeOptionalUrl(value: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    throw new Error("Please enter a valid website URL.");
  }
}

export async function updateProfileSettingsAction(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  let avatarUrl: string | undefined;
  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      const uploaded = await uploadAvatarToR2(user.id, avatarFile);
      avatarUrl = uploaded.url;
    } catch (error) {
      redirectWithStatus(locale, "error", error instanceof Error ? error.message : "Avatar upload failed.");
    }
  }

  let websiteUrl: string | null;
  try {
    websiteUrl = normalizeOptionalUrl(readString(formData, "website_url"));
  } catch (error) {
    redirectWithStatus(locale, "error", error instanceof Error ? error.message : "Profile validation failed.");
  }

  const profileUpdate = {
    display_name: readString(formData, "display_name") || user.email?.split("@")[0] || "Curvio user",
    bio: readString(formData, "bio") || null,
    principle: readString(formData, "principle") || null,
    website_url: websiteUrl,
    preferred_language: locale,
    is_public: formData.has("is_public"),
    allow_follow: formData.has("allow_follow"),
    hide_amounts_by_default: formData.has("hide_amounts_by_default"),
    show_annual_summary: formData.has("show_annual_summary"),
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileError) {
    redirectWithStatus(locale, "error", profileError.message);
  }

  const order = formData.getAll("section_order").filter((value): value is string => typeof value === "string");
  const visible = new Set(formData.getAll("section_visible").filter((value): value is string => typeof value === "string"));

  await Promise.all(
    order.map((sectionType, index) =>
      supabase
        .from("profile_sections")
        .update({
          sort_order: index + 1,
          is_visible: visible.has(sectionType),
        })
        .eq("user_id", user.id)
        .eq("section_type", sectionType),
    ),
  );

  revalidatePath(`/${locale}/dashboard/settings`);
  revalidatePath(`/${locale}/u/${user.user_metadata?.username ?? ""}`);
  redirectWithStatus(locale, "saved");
}
