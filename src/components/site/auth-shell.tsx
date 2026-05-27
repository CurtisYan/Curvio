import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

export function AuthShell({
  locale,
  title,
  submit,
  note,
  labels,
  mode,
}: {
  locale: Locale;
  title: string;
  submit: string;
  note: string;
  labels: { email: string; password: string; username: string };
  mode: "login" | "register";
}) {
  return (
    <main className="container-narrow flex min-h-screen items-center justify-center pt-24 pb-20">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{note}</p>
        </div>
        <form className="space-y-4">
          {mode === "register" ? (
            <label className="space-y-2 text-sm font-medium">
              {labels.username}
              <Input placeholder="elara_writes" />
            </label>
          ) : null}
          <label className="space-y-2 text-sm font-medium">
            {labels.email}
            <Input placeholder="you@example.com" type="email" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {labels.password}
            <Input placeholder="••••••••" type="password" />
          </label>
          <Button className="w-full" disabled type="button">
            {submit}
          </Button>
        </form>
        <div className="border-t border-border-subtle pt-4 text-center text-sm text-muted">
          {mode === "login" ? (
            <Link className="text-primary hover:text-primary-strong" href={localizePath(locale, "/register")}>
              Create an account
            </Link>
          ) : (
            <Link className="text-primary hover:text-primary-strong" href={localizePath(locale, "/login")}>
              Already have an account
            </Link>
          )}
        </div>
      </Card>
    </main>
  );
}
