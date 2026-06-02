"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

type TurnstileWindow = typeof window & {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: {
        sitekey: string;
        theme?: "auto" | "light" | "dark";
        callback?: (value?: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      },
    ) => string;
    remove?: (widgetId: string) => void;
  };
};

type TurnstileCallbacks = Record<string, (token?: string) => void>;

export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const [token, setToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const rawId = useId();
  const safeId = rawId.replace(/:/g, "");
  const callbackName = `turnstileCallback_${safeId}`;
  const expiredCallbackName = `turnstileExpired_${safeId}`;
  const errorCallbackName = `turnstileError_${safeId}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const win = window as TurnstileWindow;
    const callbacks = window as unknown as TurnstileCallbacks;

    callbacks[callbackName] = (value?: string) => {
      setToken(value ?? "");
    };

    callbacks[expiredCallbackName] = () => {
      setToken("");
    };

    callbacks[errorCallbackName] = () => {
      setToken("");
    };

    return () => {
      if (widgetIdRef.current && win.turnstile?.remove) {
        try {
          win.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors during route transitions and dev remounts.
        }
      }
      delete callbacks[callbackName];
      delete callbacks[expiredCallbackName];
      delete callbacks[errorCallbackName];
    };
  }, [callbackName, expiredCallbackName, errorCallbackName]);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || widgetIdRef.current) {
      return;
    }

    const win = window as TurnstileWindow;
    const callbacks = window as unknown as TurnstileCallbacks;

    if (!win.turnstile) {
      return;
    }

    widgetIdRef.current = win.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "light",
      callback: callbacks[callbackName],
      "expired-callback": callbacks[expiredCallbackName],
      "error-callback": callbacks[errorCallbackName],
    });
  }, [callbackName, errorCallbackName, expiredCallbackName, scriptReady, siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Script
        async
        defer
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={() => setScriptReady(true)}
      />
      <div className="flex justify-center">
        <div ref={containerRef} />
      </div>
      <input name="turnstileToken" type="hidden" value={token} />
    </div>
  );
}
