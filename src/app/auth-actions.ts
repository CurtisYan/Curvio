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

function fail(locale: Locale, path: "login" | "register", message: string): never {
  redirect(`/${locale}/${path}?error=${encodeURIComponent(message)}`);
}

export async function signInAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  if (!email || !email.includes("@")) {
    fail(locale, "login", "Please enter a valid email address.");
  }

  if (password.length < 6) {
    fail(locale, "login", "Password must be at least 6 characters.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    fail(locale, "login", error.message);
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function signUpAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const username = readString(formData, "username").toLowerCase();

  if (!email || !email.includes("@")) {
    fail(locale, "register", "Please enter a valid email address.");
  }

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    fail(
      locale,
      "register",
      "Username must be 3-24 characters and only use lowercase letters, numbers, or underscores.",
    );
  }

  if (password.length < 6) {
    fail(locale, "register", "Password must be at least 6 characters.");
  }

  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    fail(locale, "register", "This username is already taken.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username,
        preferred_language: locale,
      },
    },
  });

  if (error) {
    fail(locale, "register", error.message);
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function signOutAction(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}
