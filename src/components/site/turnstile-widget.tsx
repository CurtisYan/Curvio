"use client";

import Script from "next/script";
import { useEffect, useId, useState } from "react";

export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const [token, setToken] = useState("");
  const rawId = useId();
  const safeId = rawId.replace(/:/g, "");
  const callbackName = `turnstileCallback_${safeId}`;
  const expiredCallbackName = `turnstileExpired_${safeId}`;
  const errorCallbackName = `turnstileError_${safeId}`;

  useEffect(() => {
    const win = window as typeof window & {
      [key: string]: (token?: string) => void;
    };

    win[callbackName] = (value?: string) => {
      setToken(value ?? "");
    };

    win[expiredCallbackName] = () => {
      setToken("");
    };

    win[errorCallbackName] = () => {
      setToken("");
    };

    return () => {
      delete win[callbackName];
      delete win[expiredCallbackName];
      delete win[errorCallbackName];
    };
  }, [callbackName, expiredCallbackName, errorCallbackName]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Script
        async
        defer
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
      />
      <div
        className="cf-turnstile"
        data-callback={callbackName}
        data-error-callback={errorCallbackName}
        data-expired-callback={expiredCallbackName}
        data-sitekey={siteKey}
      />
      <input name="turnstileToken" type="hidden" value={token} />
    </div>
  );
}
