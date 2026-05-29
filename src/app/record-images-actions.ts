"use server";

import { revalidatePath } from "next/cache";
import { isLocale, type Locale } from "@/lib/i18n";
import type { RecordType } from "@/lib/types";
import { uploadRecordImageToR2 } from "@/utils/r2";
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
    return { ok: false, message: "Record id is required." };
  }

  if (!isRecordType(recordTypeValue)) {
    return { ok: false, message: "Record type is invalid." };
  }

  if (files.length === 0) {
    return { ok: false, message: "Please choose at least one image." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Please sign in before uploading images." };
  }

  const { data: record, error: recordError } = await supabase
    .from("records")
    .select("id, user_id, type")
    .eq("id", recordId)
    .maybeSingle();

  if (recordError || !record || record.user_id !== user.id) {
    return { ok: false, message: "Record not found." };
  }

  if (record.type !== recordTypeValue) {
    return { ok: false, message: "Record type mismatch." };
  }

  const { count, error: countError } = await supabase
    .from("record_images")
    .select("id", { count: "exact", head: true })
    .eq("record_id", recordId);

  if (countError) {
    return { ok: false, message: "Failed to check existing images." };
  }

  const currentCount = count ?? 0;
  if (currentCount + files.length > MAX_RECORD_IMAGES) {
    return { ok: false, message: `Each record can include up to ${MAX_RECORD_IMAGES} images.` };
  }

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
  }));

  const { error: insertError } = await supabase.from("record_images").insert(rows);

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  revalidatePath(`/${locale}/dashboard/records`);
  revalidatePath(`/${locale}/explore`);

  return { ok: true, images: rows };
}
