"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readLocale(formData: FormData): Locale {
  const locale = readString(formData, "locale");
  return isLocale(locale) ? locale : "en";
}

function fail(locale: Locale, path: "login" | "register" | "register/verify", message: string): never {
  redirect(`/${locale}/${path}?error=${encodeURIComponent(message)}`);
}

function localized(locale: Locale, en: string, zh: string) {
  return locale === "zh" ? zh : en;
}

async function verifyTurnstile(
  locale: Locale,
  path: "login" | "register" | "register/verify" | "forgot" | "reset",
  token: string,
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    fail(locale, path, "Turnstile is not configured. Please try again later.");
  }

  if (!token) {
    fail(locale, path, "Please complete the verification challenge.");
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
    }).toString(),
  });

  const result = (await response.json()) as { success: boolean; "error-codes"?: string[] };

  if (!result.success) {
    fail(locale, path, "Verification failed. Please try again.");
  }
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
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/${locale}/register/verify?email=${encodeURIComponent(email)}`);
    }

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
  const turnstileToken = readString(formData, "turnstileToken");

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

  await verifyTurnstile(locale, "register", turnstileToken);

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
        lang: locale,
        username,
        display_name: username,
        preferred_language: locale,
      },
    },
  });

  if (error) {
    fail(locale, "register", error.message);
  }

  redirect(`/${locale}/register/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOtpAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const token = readString(formData, "token").replace(/\s/g, "");

  if (!email || !email.includes("@")) {
    fail(locale, "register/verify", "Please enter the email address you used to register.");
  }

  if (!/^[0-9]{8}$/.test(token)) {
    fail(locale, "register/verify", "Please enter the 8-digit verification code.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    fail(locale, "register/verify", error.message);
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

export async function resendOtpAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();

  if (!email || !email.includes("@")) {
    fail(locale, "register/verify", "Please enter the email address you used to register.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${locale}/dashboard`,
    },
  });

  if (error) {
    fail(locale, "register/verify", error.message);
  }

  redirect(`/${locale}/register/verify?email=${encodeURIComponent(email)}&sent=1`);
}

export async function sendResetAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();

  if (!email || !email.includes("@")) {
    fail(locale, "forgot", localized(locale, "Please enter the email address you used to register.", "请输入你注册时使用的邮箱。"));
  }

  const adminClient = createAdminClient();
  if (adminClient) {
    const pageSize = 1000;
    let page = 1;
    let accountExists = false;

    while (!accountExists) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: pageSize });

      if (error) {
        fail(locale, "forgot", error.message);
      }

      accountExists = data.users.some((user) => user.email?.toLowerCase() === email);

      if (accountExists || data.users.length < pageSize) {
        break;
      }

      page += 1;
    }

    if (!accountExists) {
      fail(locale, "forgot", localized(locale, "No account found for that email address.", "没有找到该邮箱对应的账号。"));
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${locale}/reset`,
  });

  if (error) {
    fail(locale, "forgot", error.message);
  }

  redirect(`/${locale}/forgot?sent=1`);
}

export async function completeResetAction(formData: FormData) {
  const locale = readLocale(formData);
  const password = readString(formData, "password");

  if (!password || password.length < 6) {
    fail(locale, "reset", localized(locale, "Password must be at least 6 characters.", "密码至少需要 6 位。"));
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    fail(locale, "reset", localized(locale, "Your reset link is invalid or has expired. Please request a new one.", "重置链接无效或已过期，请重新申请。"));
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    fail(locale, "reset", error.message);
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
