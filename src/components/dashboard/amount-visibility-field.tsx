"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "CNY", symbol: "¥" },
  { code: "EUR", symbol: "€" },
  { code: "JPY", symbol: "¥" },
  { code: "GBP", symbol: "£" },
  { code: "HKD", symbol: "HK$" },
];

export function AmountVisibilityField({
  labels,
  defaultHidden = false,
  defaultAmount = "",
  defaultCurrency = "USD",
}: {
  labels: {
    amount: string;
    currency: string;
    amountPlaceholder: string;
    amountVisible: string;
    amountHidden: string;
  };
  defaultHidden?: boolean;
  defaultAmount?: string;
  defaultCurrency?: string;
}) {
  const initialCurrency = currencies.find((item) => item.code === defaultCurrency)?.code ?? "USD";
  const [visibilityMenuOpen, setVisibilityMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(defaultHidden);
  const [currency, setCurrency] = useState(initialCurrency);
  const visibilityMenuRef = useRef<HTMLDivElement | null>(null);
  const currencyMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (visibilityMenuRef.current && !visibilityMenuRef.current.contains(event.target as Node)) {
        setVisibilityMenuOpen(false);
      }

      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setCurrencyMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setVisibilityMenuOpen(false);
        setCurrencyMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selectedCurrency = useMemo(
    () => currencies.find((item) => item.code === currency) ?? currencies[0],
    [currency],
  );

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-offwhite p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{labels.amount}</p>
          <p className="mt-1 text-xs text-muted">
            {isHidden ? labels.amountHidden : labels.amountVisible}
          </p>
        </div>
        <div className="relative" ref={visibilityMenuRef}>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm text-muted transition-colors hover:text-primary"
            onClick={() => setVisibilityMenuOpen((value) => !value)}
            type="button"
          >
            {isHidden ? labels.amountHidden : labels.amountVisible}
            <ChevronDown className="h-4 w-4" />
          </button>
          {visibilityMenuOpen ? (
            <div className="absolute right-0 top-12 z-20 w-60 rounded-xl border border-border-subtle bg-surface-offwhite p-1 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <button
                className="block w-full rounded-lg px-3 py-3 text-left text-sm text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
                onClick={() => {
                  setIsHidden(false);
                  setVisibilityMenuOpen(false);
                }}
                type="button"
              >
                {labels.amountVisible}
              </button>
              <button
                className="block w-full rounded-lg px-3 py-3 text-left text-sm text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
                onClick={() => {
                  setIsHidden(true);
                  setVisibilityMenuOpen(false);
                }}
                type="button"
              >
                {labels.amountHidden}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <input name="show_amount" type="hidden" value={isHidden ? "0" : "1"} />
      {isHidden ? (
        <div className="rounded-lg border border-border-subtle bg-surface-container-low px-3 py-3 text-sm text-muted">
          {labels.amountHidden}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[1fr_168px]">
            <Input
              defaultValue={defaultAmount}
              inputMode="decimal"
              name="amount"
              placeholder={labels.amountPlaceholder}
            />
            <div className="relative" ref={currencyMenuRef}>
              <button
                aria-label={labels.currency}
                className="flex h-11 w-full items-center justify-between rounded-lg border border-border-subtle bg-surface-offwhite px-3 text-sm text-foreground transition-colors hover:border-primary/50"
                onClick={() => setCurrencyMenuOpen((value) => !value)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base font-semibold">{selectedCurrency.symbol}</span>
                  <span>{selectedCurrency.code}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>
              {currencyMenuOpen ? (
                <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-border-subtle bg-surface-offwhite p-1 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
                  {currencies.map((item) => (
                    <button
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-surface-container-low hover:text-primary",
                        currency === item.code && "bg-primary/10 text-primary",
                      )}
                      key={item.code}
                      onClick={() => {
                        setCurrency(item.code);
                        setCurrencyMenuOpen(false);
                      }}
                      type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base font-semibold">{item.symbol}</span>
                        <span>{item.code}</span>
                      </span>
                      <span className="text-xs text-muted">{currency === item.code ? "Selected" : ""}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <input name="currency" type="hidden" value={currency} />
        </>
      )}
    </div>
  );
}
