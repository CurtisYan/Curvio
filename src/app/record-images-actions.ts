"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import type { RecordType } from "@/lib/types";
import { deleteRecordImageFromR2, uploadRecordImageToR2 } from "@/utils/r2";
import { createClient } from "@/utils/supabase/server";

const MAX_RECORD_IMAGES = 20;

const recordTypeValues: RecordType[] = ["donation", "kindness", "open_source"];

function isRecordType(value: string): value is RecordType {
  return recordTypeValues.includes(value as RecordType);
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readLocale(formData: FormData): Locale {
  const locale = readString(formData, "locale");
  return isLocale(locale) ? locale : "en";
}

function redirectToEdit(locale: Locale, recordId: string, status: "saved" | "error", message?: string): never {
  const params = new URLSearchParams({ status });
  if (message) {
    params.set("message", message);
  }
  redirect(`/${locale}/dashboard/records/${recordId}/edit?${params.toString()}`);
}

function imageActionMessage(locale: Locale, key: string) {
  const messages = {
    en: {
      auth: "Please sign in before uploading images.",
      record: "Record not found.",
      type: "Record type mismatch.",
      limit: `Each record can include up to ${MAX_RECORD_IMAGES} images.`,
      missing: "Please choose at least one image.",
      upload: "Image upload failed.",
      save: "Image metadata could not be saved.",
      delete: "Image could not be deleted.",
      cover: "Cover image updated.",
      order: "Image order updated.",
    },
    zh: {
      auth: "请先登录再上传图片。",
      record: "记录不存在。",
      type: "记录类型不匹配。",
      limit: `每篇记录最多上传 ${MAX_RECORD_IMAGES} 张图片。`,
      missing: "请先选择图片。",
      upload: "图片上传失败。",
      save: "图片元数据保存失败。",
      delete: "图片删除失败。",
      cover: "已设置主图。",
      order: "图片顺序已更新。",
    },
  };

  return messages[locale]?.[key as keyof (typeof messages)["en"]] ?? messages.en[key as keyof (typeof messages)["en"]];
}

function readFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function uploadRecordImagesAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const recordTypeValue = readString(formData, "record_type");
  const files = readFiles(formData, "images");

  if (!recordId) {
    redirect(`/${locale}/dashboard/records`);
  }

  if (!isRecordType(recordTypeValue)) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "type"));
  }

  if (files.length === 0) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "missing"));
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
    .select("id, user_id, type")
    .eq("id", recordId)
    .maybeSingle();

  if (recordError || !record || record.user_id !== user.id) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "record"));
  }

  if (record.type !== recordTypeValue) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "type"));
  }

  const { count, error: countError } = await supabase
    .from("record_images")
    .select("id", { count: "exact", head: true })
    .eq("record_id", recordId);

  if (countError) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "save"));
  }

  const currentCount = count ?? 0;
  if (currentCount + files.length > MAX_RECORD_IMAGES) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "limit"));
  }

  const { data: existingCover } = await supabase
    .from("record_images")
    .select("id")
    .eq("record_id", recordId)
    .eq("is_cover", true)
    .maybeSingle();

  const shouldSetCover = !existingCover;

  const uploads = await Promise.all(
    files.map((file) =>
      uploadRecordImageToR2({
        userId: user.id,
        recordId,
        type: recordTypeValue,
        file,
      }),
    ),
  );

  const rows = uploads.map((upload, index) => ({
    record_id: recordId,
    user_id: user.id,
    r2_key: upload.key,
    r2_url: upload.url,
    mime_type: files[index].type,
    file_size: files[index].size,
    sort_order: currentCount + index + 1,
    is_cover: shouldSetCover && index === 0,
  }));

  const { error: insertError } = await supabase.from("record_images").insert(rows);

  if (insertError) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "save"));
  }

  revalidatePath(`/${locale}/dashboard/records`);
  revalidatePath(`/${locale}/explore`);

  redirectToEdit(locale, recordId, "saved");
}

export async function deleteRecordImageAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const imageId = readString(formData, "image_id");

  if (!recordId || !imageId) {
    redirect(`/${locale}/dashboard/records`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  const { data: image, error: imageError } = await supabase
    .from("record_images")
    .select("id, r2_key, is_cover")
    .eq("id", imageId)
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (imageError || !image) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "delete"));
  }

  try {
    await deleteRecordImageFromR2(image.r2_key);
  } catch {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "delete"));
  }

  const { error: deleteError } = await supabase
    .from("record_images")
    .delete()
    .eq("id", imageId)
    .eq("user_id", user.id);

  if (deleteError) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "delete"));
  }

  if (image.is_cover) {
    const { data: nextImage } = await supabase
      .from("record_images")
      .select("id")
      .eq("record_id", recordId)
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextImage?.id) {
      await supabase
        .from("record_images")
        .update({ is_cover: true })
        .eq("id", nextImage.id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath(`/${locale}/dashboard/records`);
  redirectToEdit(locale, recordId, "saved");
}

export async function setCoverImageAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const imageId = readString(formData, "image_id");

  if (!recordId || !imageId) {
    redirect(`/${locale}/dashboard/records`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  const { data: image } = await supabase
    .from("record_images")
    .select("id")
    .eq("id", imageId)
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!image) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "record"));
  }

  await supabase
    .from("record_images")
    .update({ is_cover: false })
    .eq("record_id", recordId)
    .eq("user_id", user.id);

  const { error: coverError } = await supabase
    .from("record_images")
    .update({ is_cover: true })
    .eq("id", imageId)
    .eq("user_id", user.id);

  if (coverError) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "save"));
  }

  revalidatePath(`/${locale}/dashboard/records`);
  redirectToEdit(locale, recordId, "saved", imageActionMessage(locale, "cover"));
}

export async function moveRecordImageAction(formData: FormData) {
  const locale = readLocale(formData);
  const recordId = readString(formData, "record_id");
  const imageId = readString(formData, "image_id");
  const direction = readString(formData, "direction");

  if (!recordId || !imageId || !direction) {
    redirect(`/${locale}/dashboard/records`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login`);
  }

  const { data: images } = await supabase
    .from("record_images")
    .select("id, sort_order")
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (!images || images.length === 0) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "record"));
  }

  const index = images.findIndex((image) => image.id === imageId);
  if (index < 0) {
    redirectToEdit(locale, recordId, "error", imageActionMessage(locale, "record"));
  }

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= images.length) {
    redirectToEdit(locale, recordId, "saved");
  }

  const current = images[index];
  const target = images[swapWith];

  await supabase
    .from("record_images")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id)
    .eq("user_id", user.id);

  await supabase
    .from("record_images")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id)
    .eq("user_id", user.id);

  revalidatePath(`/${locale}/dashboard/records`);
  redirectToEdit(locale, recordId, "saved", imageActionMessage(locale, "order"));
}
