"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { replaceImagePlaceholders } from "@/lib/record-image-markdown";
import { formatRecordPublicId } from "@/lib/record-public-id";
import { recordTypeToSegment } from "@/lib/record-types";
import type { RecordType } from "@/lib/types";
import { deleteRecordImageFromR2, uploadAvatarToR2, uploadRecordImageToR2 } from "@/utils/r2";
import { createClient } from "@/utils/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readLocale(formData: FormData): Locale {
  const locale = readString(formData, "locale");
  return isLocale(locale) ? locale : "en";
}

function readFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function readImageVisibilities(formData: FormData) {
  return formData
    .getAll("image_visibility")
    .map((value) => (value === "private" ? "private" : "public"));
}

function readImageTokens(formData: FormData) {
  return formData
    .getAll("image_token")
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

const recordTypeValues: RecordType[] = ["donation", "kindness", "open_source"];

function isRecordType(value: string): value is RecordType {
  return recordTypeValues.includes(value as RecordType);
}

const MAX_RECORD_IMAGES = 15;

type RecordFormState = {
  status: "idle" | "error";
  message?: string;
};

function recordEditRedirect(
  locale: Locale,
  recordId: string,
  status: "saved" | "error",
  message?: string,
): never {
  const params = new URLSearchParams({ status });
  if (message) {
    params.set("message", message);
  }
  redirect(`/${locale}/dashboard/records/${recordId}/edit?${params.toString()}`);
}

function dashboardRedirect(
  locale: Locale,
  path: string,
  status: "archived" | "restored" | "deleted" | "manage_error",
): never {
  const safePaths = new Set([
    "dashboard",
    "dashboard/records",
    "dashboard/donations",
    "dashboard/acts",
    "dashboard/projects",
  ]);
  const safePath = safePaths.has(path) ? path : "dashboard";
  redirect(`/${locale}/${safePath}?status=${status}`);
}

function recordFormMessage(locale: Locale, key: string) {
  const messages = {
    en: {
      required: "Please fill in title, date, and description.",
      type: "Please choose a record type.",
      auth: "Please sign in to continue.",
      amount: "Amount must be a valid number.",
      imageLimit: `Each record can include up to ${MAX_RECORD_IMAGES} images.`,
      createFailed: "Failed to create record.",
      uploadFailed: "Image upload failed.",
      imageSaveFailed: "Image metadata could not be saved.",
    },
    zh: {
      required: "请填写标题、日期和内容。",
      type: "请选择记录类型。",
      auth: "请先登录。",
      amount: "金额格式不正确。",
      imageLimit: `每篇记录最多上传 ${MAX_RECORD_IMAGES} 张图片。`,
      createFailed: "记录保存失败。",
      uploadFailed: "图片上传失败。",
      imageSaveFailed: "图片元数据保存失败。",
    },
  };

  return messages[locale]?.[key as keyof (typeof messages)["en"]] ?? messages.en[key as keyof (typeof messages)["en"]];
}

async function cleanupCreatedRecord({
  recordId,
  uploadedKeys,
}: {
  recordId: string;
  uploadedKeys: string[];
}) {
  await Promise.allSettled(uploadedKeys.map((key) => deleteRecordImageFromR2(key)));

  const supabase = await createClient();
  await supabase.from("record_images").delete().eq("record_id", recordId);
  await supabase.from("records").delete().eq("id", recordId);
}

export async function createRecordAction(
  _prevState: RecordFormState,
  formData: FormData,
): Promise<RecordFormState> {
  const locale = readLocale(formData);
  const typeValue = readString(formData, "type");
  const title = readString(formData, "title");
  const date = readString(formData, "date");
  const content = readString(formData, "content");
  const files = readFiles(formData, "images");
  const imageVisibilities = readImageVisibilities(formData);
  const imageTokens = readImageTokens(formData);

  if (!title || !date || !content) {
    return { status: "error", message: recordFormMessage(locale, "required") };
  }

  if (!isRecordType(typeValue)) {
    return { status: "error", message: recordFormMessage(locale, "type") };
  }

  if (files.length > MAX_RECORD_IMAGES) {
    return { status: "error", message: recordFormMessage(locale, "imageLimit") };
  }

  const showAmount = readString(formData, "show_amount") === "1";
  const amountRaw = readString(formData, "amount");
  const currency = readString(formData, "currency");
  let amountValue: number | null = null;

  if (amountRaw) {
    const parsed = Number.parseFloat(amountRaw);
    if (Number.isNaN(parsed)) {
      return { status: "error", message: recordFormMessage(locale, "amount") };
    }
    amountValue = parsed;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: recordFormMessage(locale, "auth") };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { status: "error", message: recordFormMessage(locale, "createFailed") };
  }

  const { data: record, error: recordError } = await supabase
    .from("records")
    .insert({
      user_id: user.id,
      type: typeValue,
      title,
      content,
      date,
      language: locale,
      is_public: formData.has("is_public"),
      is_anonymous: formData.has("is_anonymous"),
      show_amount: showAmount && amountValue !== null,
      amount: amountValue,
      currency: amountValue !== null ? currency || null : null,
    })
    .select("id, date")
    .single();

  if (recordError || !record) {
    return { status: "error", message: recordFormMessage(locale, "createFailed") };
  }

  const publicRecordId = formatRecordPublicId(record.date, record.id);

  if (files.length > 0) {
    const uploadedKeys: string[] = [];

    try {
      const uploads: Awaited<ReturnType<typeof uploadRecordImageToR2>>[] = [];
      for (const [index, file] of files.entries()) {
        const upload = await uploadRecordImageToR2({
          userId: user.id,
          recordId: record.id,
          type: typeValue,
          file,
          imageNumber: index + 1,
        });
        uploadedKeys.push(upload.key);
        uploads.push(upload);
      }
      const publicImageUrlsByToken = new Map<string, string>();

      const rows = uploads.map((upload, index) => ({
        record_id: record.id,
        user_id: user.id,
        r2_key: upload.key,
        r2_url: upload.url,
        mime_type: files[index].type,
        file_size: files[index].size,
        sort_order: index + 1,
        is_cover: index === 0,
        visibility: imageVisibilities[index] ?? "public",
      }));

      uploads.forEach((upload, index) => {
        const token = imageTokens[index];
        if (token && (imageVisibilities[index] ?? "public") === "public") {
          publicImageUrlsByToken.set(token, upload.url);
        }
      });

      const { error: insertError } = await supabase.from("record_images").insert(rows);

      if (insertError) {
        await cleanupCreatedRecord({ recordId: record.id, uploadedKeys });
        return { status: "error", message: recordFormMessage(locale, "imageSaveFailed") };
      }

      const contentWithImages = replaceImagePlaceholders(content, publicImageUrlsByToken);
      if (contentWithImages !== content) {
        const { error: contentUpdateError } = await supabase
          .from("records")
          .update({ content: contentWithImages })
          .eq("id", record.id)
          .eq("user_id", user.id);

        if (contentUpdateError) {
          await cleanupCreatedRecord({ recordId: record.id, uploadedKeys });
          return { status: "error", message: recordFormMessage(locale, "imageSaveFailed") };
        }
      }
    } catch (error) {
      await cleanupCreatedRecord({ recordId: record.id, uploadedKeys });
      return {
        status: "error",
        message: error instanceof Error ? error.message : recordFormMessage(locale, "uploadFailed"),
      };
    }
  }

  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/records`);
  revalidatePath(`/${locale}/dashboard/donations`);
  revalidatePath(`/${locale}/dashboard/acts`);
  revalidatePath(`/${locale}/dashboard/projects`);
  revalidatePath(`/${locale}/u/${profile.username}`);

  redirect(
    `/${locale}/u/${profile.username}/${recordTypeToSegment(typeValue)}/${publicRecordId}`,
  );
}

export async function updateRecordAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const title = readString(formData, "title");
  const date = readString(formData, "date");
  const content = readString(formData, "content");

  if (!recordId) {
    redirect(`/${locale}/dashboard/records`);
  }

  if (!title || !date || !content) {
    recordEditRedirect(locale, recordId, "error", "Missing required fields.");
  }

  const showAmount = readString(formData, "show_amount") === "1";
  const amountRaw = readString(formData, "amount");
  const currency = readString(formData, "currency");
  let amountValue: number | null = null;

  if (amountRaw) {
    const parsed = Number.parseFloat(amountRaw);
    if (Number.isNaN(parsed)) {
      recordEditRedirect(locale, recordId, "error", "Amount must be a valid number.");
    }
    amountValue = parsed;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  const { data: record, error: recordError } = await supabase
    .from("records")
    .select("id, date")
    .eq("id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (recordError || !record) {
    recordEditRedirect(locale, recordId, "error", "Record not found.");
  }

  const publicRecordId = formatRecordPublicId(record.date, record.id);

  const { error: updateError } = await supabase
    .from("records")
    .update({
      title,
      date,
      content,
      show_amount: showAmount && amountValue !== null,
      amount: amountValue,
      currency: amountValue !== null ? currency || null : null,
      is_public: formData.has("is_public"),
      is_anonymous: formData.has("is_anonymous"),
    })
    .eq("id", recordId);

  if (updateError) {
    recordEditRedirect(locale, recordId, "error", updateError.message);
  }

  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/records`);
  revalidatePath(`/${locale}/dashboard/donations`);
  revalidatePath(`/${locale}/dashboard/acts`);
  revalidatePath(`/${locale}/dashboard/projects`);
  recordEditRedirect(locale, publicRecordId, "saved");
}

async function readOwnedRecord(recordId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, profile: null, record: null };
  }

  const [{ data: profile }, { data: record, error: recordError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("records")
      .select("id, type, date")
      .eq("id", recordId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    supabase,
    user,
    profile,
    record: recordError ? null : record,
  };
}

async function revalidateRecordSurfaces(locale: Locale, username?: string) {
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/records`);
  revalidatePath(`/${locale}/dashboard/donations`);
  revalidatePath(`/${locale}/dashboard/acts`);
  revalidatePath(`/${locale}/dashboard/projects`);
  revalidatePath(`/${locale}/explore`);

  if (username) {
    revalidatePath(`/${locale}/u/${username}`);
  }
}

export async function archiveRecordAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const returnPath = readString(formData, "return_path");

  if (!recordId) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  const { supabase, user, profile, record } = await readOwnedRecord(recordId);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!record) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  const { error } = await supabase
    .from("records")
    .update({ archived_at: new Date().toISOString(), is_public: false })
    .eq("id", record.id)
    .eq("user_id", user.id);

  if (error) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  await revalidateRecordSurfaces(locale, profile?.username);
  dashboardRedirect(locale, returnPath, "archived");
}

export async function restoreRecordAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const returnPath = readString(formData, "return_path");

  if (!recordId) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  const { supabase, user, profile, record } = await readOwnedRecord(recordId);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!record) {
    dashboardRedirect(locale, returnPath, "deleted");
  }

  const { error } = await supabase
    .from("records")
    .update({ archived_at: null })
    .eq("id", record.id)
    .eq("user_id", user.id);

  if (error) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  await revalidateRecordSurfaces(locale, profile?.username);
  dashboardRedirect(locale, returnPath, "restored");
}

export async function deleteRecordAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const returnPath = readString(formData, "return_path");
  const confirmed = readString(formData, "confirm_delete") === "1";

  if (!recordId || !confirmed) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  const { supabase, user, profile, record } = await readOwnedRecord(recordId);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!record) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  const { data: images } = await supabase
    .from("record_images")
    .select("r2_key")
    .eq("record_id", record.id)
    .eq("user_id", user.id);

  await Promise.allSettled(
    (images ?? []).map((image) => deleteRecordImageFromR2(image.r2_key)),
  );

  await supabase
    .from("record_images")
    .delete()
    .eq("record_id", record.id)
    .eq("user_id", user.id);

  const { error: deleteError } = await supabase
    .from("records")
    .delete()
    .eq("id", record.id)
    .eq("user_id", user.id);

  if (deleteError) {
    dashboardRedirect(locale, returnPath, "manage_error");
  }

  await revalidateRecordSurfaces(locale, profile?.username);
  dashboardRedirect(locale, returnPath, "deleted");
}

function redirectWithStatus(locale: Locale, status: "saved" | "error", message?: string): never {
  const params = new URLSearchParams({ status });
  if (message) {
    params.set("message", message);
  }
  redirect(`/${locale}/settings?${params.toString()}`);
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
      const message = error instanceof Error && error.message.includes("R2 is not configured")
        ? "r2_not_configured"
        : "avatar_upload_failed";
      redirectWithStatus(locale, "error", message);
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
    preferred_editor_mode: readString(formData, "preferred_editor_mode") === "plain" ? "plain" : "markdown",
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

  revalidatePath(`/${locale}/settings`);
  revalidatePath(`/${locale}/u/${user.user_metadata?.username ?? ""}`);
  redirectWithStatus(locale, "saved");
}

export async function followProfileAction(formData: FormData) {
  const locale = readLocale(formData);
  const username = readString(formData, "username");
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, username, allow_follow")
    .eq("username", username)
    .maybeSingle();

  if (!targetProfile || targetProfile.id === user.id || !targetProfile.allow_follow) {
    redirect(`/${locale}/u/${username}`);
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetProfile.id,
  });

  if (error) {
    redirect(`/${locale}/u/${username}`);
  }

  revalidatePath(`/${locale}/u/${username}`);
  redirect(`/${locale}/u/${username}`);
}

export async function unfollowProfileAction(formData: FormData) {
  const locale = readLocale(formData);
  const username = readString(formData, "username");
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (!targetProfile || targetProfile.id === user.id) {
    redirect(`/${locale}/u/${username}`);
  }

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetProfile.id);

  revalidatePath(`/${locale}/u/${username}`);
  redirect(`/${locale}/u/${username}`);
}
