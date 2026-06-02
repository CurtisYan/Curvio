export function isUnsafeQueryMessage(message: string | undefined) {
  const value = message?.trim();

  if (!value) {
    return false;
  }

  const lowerValue = value.toLowerCase();
  const blockedPatterns = [
    "fetch failed",
    "failed to fetch",
    "networkerror",
    "network error",
    "typeerror",
    "schema cache",
    "supabase",
    "http://",
    "https://",
    "enoent",
    "econn",
  ];

  return value.length > 180 || blockedPatterns.some((pattern) => lowerValue.includes(pattern));
}

export function safeQueryMessage(message: string | undefined, fallback: string) {
  const value = message?.trim();

  if (!value) {
    return undefined;
  }

  if (isUnsafeQueryMessage(value)) {
    return fallback;
  }

  return value;
}
