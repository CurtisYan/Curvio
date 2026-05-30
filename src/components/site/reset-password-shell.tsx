import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";

export function ResetPasswordShell({
  locale,
  labels,
  token,
  error,
  resetAction,
}: {
  locale: Locale;
  labels: any;
  token?: string;
  error?: string;
  resetAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Enter a new password to complete the reset.</p>
        </div>
        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
        <form action={resetAction} className="space-y-4">
          <input name="locale" type="hidden" value={locale} />
          <input name="access_token" type="hidden" value={token ?? ""} />
          <label className="space-y-2 text-sm font-medium">
            New password
            <Input autoComplete="new-password" minLength={6} name="password" placeholder="New password" required type="password" />
          </label>
          <Button className="w-full" type="submit">
            Set password
          </Button>
        </form>
      </Card>
    </main>
  );
}
