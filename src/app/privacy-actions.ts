"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readLocale(formData: FormData): Locale {
  const locale = readString(formData, "locale");
  return isLocale(locale) ? locale : "en";
}

export async function submitDeletionRequestAction(formData: FormData) {
  const locale = readLocale(formData);
  const requestContent = readString(formData, "request_content");

  if (requestContent.length < 40) {
    redirect(`/${locale}/privacy?error=${encodeURIComponent("Please fill in the deletion template in full.")}`);
  }

  const markers = ["Request Type:", "Data Scope:", "Reason:", "Confirmation:"];
  const containsTemplateMarkers = markers.every((marker) => requestContent.includes(marker));

  if (!containsTemplateMarkers) {
    redirect(`/${locale}/privacy?error=${encodeURIComponent("Please keep the template headings when submitting.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?error=${encodeURIComponent("Please sign in before submitting a deletion request.")}`);
  }

  const { error } = await supabase.from("deletion_requests").insert({
    user_id: user.id,
    request_content: requestContent,
    status: "pending",
  });

  if (error) {
    redirect(`/${locale}/privacy?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/${locale}/privacy`);
  redirect(`/${locale}/privacy?requested=1`);
}
