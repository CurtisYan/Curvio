"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(defaultHidden);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-offwhite p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{labels.amount}</p>
          <p className="mt-1 text-xs text-muted">
            {isHidden ? labels.amountHidden : labels.amountVisible}
          </p>
        </div>
        <div className="relative">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm text-muted transition-colors hover:text-primary"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            {isHidden ? labels.amountHidden : labels.amountVisible}
            <ChevronDown className="h-4 w-4" />
          </button>
          {isOpen ? (
            <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-border-subtle bg-surface-offwhite p-1 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
                onClick={() => {
                  setIsHidden(false);
                  setIsOpen(false);
                }}
                type="button"
              >
                {labels.amountVisible}
              </button>
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-container-low hover:text-primary"
                onClick={() => {
                  setIsHidden(true);
                  setIsOpen(false);
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
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <Input
            defaultValue={defaultAmount}
            inputMode="decimal"
            name="amount"
            placeholder={labels.amountPlaceholder}
          />
          <Input
            aria-label={labels.currency}
            defaultValue={defaultCurrency}
            name="currency"
          />
        </div>
      )}
    </div>
  );
}
