"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
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

function fail(
  locale: Locale,
  path: "login" | "register" | "register/verify" | "forgot" | "reset",
  message: string,
): never {
  redirect(`/${locale}/${path}?error=${encodeURIComponent(message)}`);
}

function failWithParams(
  locale: Locale,
  path: "login" | "register" | "register/verify" | "forgot" | "reset",
  message: string,
  params: Record<string, string>,
): never {
  const searchParams = new URLSearchParams({
    error: message,
    ...params,
  });

  redirect(`/${locale}/${path}?${searchParams.toString()}`);
}

function localized(locale: Locale, en: string, zh: string) {
  return locale === "zh" ? zh : en;
}

function authServiceUnavailableMessage(locale: Locale) {
  return localized(
    locale,
    "Sign-in service is temporarily unavailable. Please try again in a moment.",
    "登录服务暂时不可用，请稍后再试。",
  );
}

function loginChallengeMessage(locale: Locale) {
  return localized(locale, "Please complete verification before trying again.", "请先完成验证后再重试。");
}

function verificationRequiredMessage(locale: Locale) {
  return localized(locale, "Please complete the verification challenge.", "请先完成人机验证。");
}

function turnstileUnavailableMessage(locale: Locale) {
  return localized(locale, "Verification is not configured yet. Please try again later.", "验证服务尚未配置完成，请稍后再试。");
}

function turnstileFailedMessage(locale: Locale) {
  return localized(locale, "Verification failed. Please try again.", "验证失败，请重试。");
}

function invalidLoginMessage(locale: Locale) {
  return localized(locale, "Invalid email or password.", "邮箱或密码不正确。");
}

function invalidEmailMessage(locale: Locale) {
  return localized(locale, "Please enter a valid email address.", "请输入有效的邮箱地址。");
}

function passwordTooShortMessage(locale: Locale) {
  return localized(locale, "Password must be at least 6 characters.", "密码至少需要 6 位。");
}

function invalidUsernameMessage(locale: Locale) {
  return localized(
    locale,
    "Username must be 4-20 characters and only use lowercase letters, numbers, or underscores.",
    "用户名需为 4-20 个字符，仅限小写字母、数字和下划线。",
  );
}

function invalidDisplayNameMessage(locale: Locale) {
  return localized(locale, "Display name must be 2-40 characters.", "展示名需为 2-40 个字符。");
}

function usernameTakenMessage(locale: Locale) {
  return localized(locale, "This username is already taken.", "这个用户名已被占用。");
}

function verificationEmailMessage(locale: Locale) {
  return localized(locale, "Please enter the email address you used to register.", "请输入你注册时使用的邮箱。");
}

function verificationCodeMessage(locale: Locale) {
  return localized(locale, "Please enter the 8-digit verification code.", "请输入 8 位验证码。");
}

function resetRateLimitMessage(locale: Locale) {
  return localized(locale, "Too many reset requests. Please try again later.", "重置请求过于频繁，请稍后再试。");
}

function resetLinkInvalidMessage(locale: Locale) {
  return localized(
    locale,
    "Your reset link is invalid or has expired. Please request a new one.",
    "重置链接无效或已过期，请重新申请。",
  );
}

function publicAuthErrorMessage(locale: Locale, message: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("invalid login credentials") ||
    lowerMessage.includes("invalid email or password")
  ) {
    return invalidLoginMessage(locale);
  }

  const unsafePatterns = [
    "fetch failed",
    "failed to fetch",
    "networkerror",
    "network error",
    "typeerror",
    "supabase",
    "http://",
    "https://",
    "econn",
  ];

  if (unsafePatterns.some((pattern) => lowerMessage.includes(pattern))) {
    return authServiceUnavailableMessage(locale);
  }

  return message;
}

async function readClientIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("cf-connecting-ip") ?? headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip");

  if (!forwardedFor) {
    return "127.0.0.1";
  }

  return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
}

function hashRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

async function countRecentLoginFailures(emailHash: string) {
  const adminClient = createAdminClient();

  if (!adminClient) {
    return 0;
  }

  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error } = await adminClient
    .from("login_failures")
    .select("id", { count: "exact", head: true })
    .eq("email_hash", emailHash)
    .gte("created_at", windowStart);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

async function recordLoginFailure(emailHash: string, ipAddress: string) {
  const adminClient = createAdminClient();

  if (!adminClient) {
    return;
  }

  await adminClient.from("login_failures").insert({
    email_hash: emailHash,
    ip_address: ipAddress,
  });
}

async function clearLoginFailures(emailHash: string) {
  const adminClient = createAdminClient();

  if (!adminClient) {
    return;
  }

  await adminClient.from("login_failures").delete().eq("email_hash", emailHash);
}

async function redirectToProfileOrNew(locale: Locale, supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/new`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) {
    redirect(`/${locale}/u/${profile.username}`);
  }

  redirect(`/${locale}/new`);
}

async function verifyTurnstile(
  locale: Locale,
  path: "login" | "register" | "register/verify" | "forgot" | "reset",
  token: string,
  options?: { challenge?: boolean; email?: string; params?: Record<string, string> },
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const errorParams = options?.params ?? {};

  if (!secret) {
    if (options?.challenge && path === "login") {
      failWithParams(locale, path, turnstileUnavailableMessage(locale), {
        challenge: "1",
        email: options.email ?? "",
      });
    }

    if (Object.keys(errorParams).length > 0) {
      failWithParams(locale, path, turnstileUnavailableMessage(locale), errorParams);
    }

    fail(locale, path, turnstileUnavailableMessage(locale));
  }

  if (!token) {
    if (options?.challenge && path === "login") {
      failWithParams(locale, path, loginChallengeMessage(locale), {
        challenge: "1",
        email: options.email ?? "",
      });
    }

    if (Object.keys(errorParams).length > 0) {
      failWithParams(locale, path, verificationRequiredMessage(locale), errorParams);
    }

    fail(locale, path, verificationRequiredMessage(locale));
  }

  let response: Response;
  try {
    response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }).toString(),
    });
  } catch {
    if (options?.challenge && path === "login") {
      failWithParams(locale, path, authServiceUnavailableMessage(locale), {
        challenge: "1",
        email: options.email ?? "",
      });
    }

    if (Object.keys(errorParams).length > 0) {
      failWithParams(locale, path, authServiceUnavailableMessage(locale), errorParams);
    }

    fail(locale, path, authServiceUnavailableMessage(locale));
  }

  const result = (await response.json()) as { success: boolean; "error-codes"?: string[] };

  if (!result.success) {
    if (options?.challenge && path === "login") {
      failWithParams(locale, path, turnstileFailedMessage(locale), {
        challenge: "1",
        email: options.email ?? "",
      });
    }

    if (Object.keys(errorParams).length > 0) {
      failWithParams(locale, path, turnstileFailedMessage(locale), errorParams);
    }

    fail(locale, path, turnstileFailedMessage(locale));
  }
}

export async function signInAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const turnstileToken = readString(formData, "turnstileToken");

  if (!email || !email.includes("@")) {
    fail(locale, "login", invalidEmailMessage(locale));
  }

  if (password.length < 6) {
    fail(locale, "login", passwordTooShortMessage(locale));
  }

  const emailHash = hashRateLimitKey(email);
  const ipAddress = await readClientIp();
  const recentFailures = await countRecentLoginFailures(emailHash);
  const challengeRequired = recentFailures >= 1;

  if (challengeRequired) {
    if (!turnstileToken) {
      failWithParams(
        locale,
        "login",
        loginChallengeMessage(locale),
        { challenge: "1", email },
      );
    }

    await verifyTurnstile(locale, "login", turnstileToken, { challenge: true, email });
  }

  const supabase = await createClient();
  let signInError: Error | null = null;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    signInError = error;
  } catch (error) {
    signInError = error instanceof Error ? error : new Error("Sign-in failed.");
  }

  if (signInError) {
    if (signInError.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/${locale}/register/verify?email=${encodeURIComponent(email)}`);
    }

    await recordLoginFailure(emailHash, ipAddress);
    failWithParams(locale, "login", publicAuthErrorMessage(locale, signInError.message), {
      challenge: "1",
      email,
    });
  }

  await clearLoginFailures(emailHash);
  revalidatePath("/", "layout");
  await redirectToProfileOrNew(locale, supabase);
}

export async function signUpAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const username = readString(formData, "username").toLowerCase();
  const displayName = readString(formData, "display_name");
  const turnstileToken = readString(formData, "turnstileToken");
  const registerParams = {
    email,
    username,
    display_name: displayName,
  };

  if (!email || !email.includes("@")) {
    failWithParams(locale, "register", invalidEmailMessage(locale), registerParams);
  }

  if (!/^[a-z0-9_]{4,20}$/.test(username)) {
    failWithParams(locale, "register", invalidUsernameMessage(locale), registerParams);
  }

  if (displayName.length < 2 || displayName.length > 40) {
    failWithParams(locale, "register", invalidDisplayNameMessage(locale), registerParams);
  }

  if (password.length < 6) {
    failWithParams(locale, "register", passwordTooShortMessage(locale), registerParams);
  }

  await verifyTurnstile(locale, "register", turnstileToken, { params: registerParams });

  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    failWithParams(locale, "register", usernameTakenMessage(locale), registerParams);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        lang: locale,
        username,
        display_name: displayName,
        preferred_language: locale,
      },
    },
  });

  if (error) {
    failWithParams(locale, "register", publicAuthErrorMessage(locale, error.message), registerParams);
  }

  redirect(`/${locale}/register/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOtpAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const token = readString(formData, "token").replace(/\s/g, "");

  if (!email || !email.includes("@")) {
    fail(locale, "register/verify", verificationEmailMessage(locale));
  }

  if (!/^[0-9]{8}$/.test(token)) {
    failWithParams(locale, "register/verify", verificationCodeMessage(locale), { email });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    fail(locale, "register/verify", publicAuthErrorMessage(locale, error.message));
  }

  revalidatePath("/", "layout");
  await redirectToProfileOrNew(locale, supabase);
}

export async function resendOtpAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();

  if (!email || !email.includes("@")) {
    fail(locale, "register/verify", verificationEmailMessage(locale));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${locale}/new`,
    },
  });

  if (error) {
    fail(locale, "register/verify", publicAuthErrorMessage(locale, error.message));
  }

  redirect(`/${locale}/register/verify?email=${encodeURIComponent(email)}&sent=1`);
}

export async function sendResetAction(formData: FormData) {
  const locale = readLocale(formData);
  const email = readString(formData, "email").toLowerCase();
  const turnstileToken = readString(formData, "turnstileToken");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail(locale, "forgot", verificationEmailMessage(locale));
  }

  await verifyTurnstile(locale, "forgot", turnstileToken);

  const adminClient = createAdminClient();
  if (adminClient) {
    const ipAddress = await readClientIp();
    const emailHash = hashRateLimitKey(email);
    const { data: rateLimitResult, error: rateLimitError } = await adminClient.rpc("consume_reset_request_limit", {
      p_ip_address: ipAddress,
      p_email_hash: emailHash,
      p_window_minutes: 15,
      p_limit: 3,
    });

    if (rateLimitError) {
      fail(locale, "forgot", resetRateLimitMessage(locale));
    }

    const rateLimitRow = Array.isArray(rateLimitResult) ? rateLimitResult[0] : rateLimitResult;
    if (rateLimitRow && typeof rateLimitRow === "object" && "allowed" in rateLimitRow && rateLimitRow.allowed === false) {
      fail(locale, "forgot", resetRateLimitMessage(locale));
    }
  }

  // Standard privacy-preserving behaviour: always show the same response
  // regardless of whether the email exists in the system. This avoids
  // leaking account existence information.
  const supabase = await createClient();
  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${locale}/reset`,
    });
  } catch {
    // Swallow errors to avoid revealing information. Consider logging server-side.
  }

  // Always respond with a generic message to the user.
  const cookieStore = await cookies();
  cookieStore.set("curvio_reset_sent", "1", {
    httpOnly: true,
    maxAge: 300,
    path: `/${locale}/forgot`,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect(`/${locale}/forgot`);
}

export async function completeResetAction(formData: FormData) {
  const locale = readLocale(formData);
  const password = readString(formData, "password");

  if (!password || password.length < 6) {
    fail(locale, "reset", passwordTooShortMessage(locale));
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    fail(locale, "reset", resetLinkInvalidMessage(locale));
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    fail(locale, "reset", publicAuthErrorMessage(locale, error.message));
  }

  revalidatePath("/", "layout");
  await redirectToProfileOrNew(locale, supabase);
}

export async function signOutAction(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}
