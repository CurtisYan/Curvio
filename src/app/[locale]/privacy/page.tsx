import Link from "next/link";
import { Shield, Eye, Trash2, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { submitDeletionRequestAction } from "@/app/privacy-actions";
import { getDictionary, isLocale, localizePath, type Locale } from "@/lib/i18n";
import { createClient } from "@/utils/supabase/server";

export default async function PrivacyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ requested?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { requested, error } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const messages = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let historyRows: Array<{ id: string; status: "pending" | "processing" | "completed" | "rejected"; created_at: string }> = [];
  let historyError: string | null = null;

  if (user) {
    const { data, error: historyQueryError } = await supabase
      .from("deletion_requests")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (historyQueryError) {
      if (historyQueryError.message.includes("deletion_requests") && historyQueryError.message.toLowerCase().includes("schema cache")) {
        historyError = messages.privacy.historyWarming;
      } else {
        historyError = historyQueryError.message;
      }
    } else {
      historyRows = (data ?? []) as Array<{ id: string; status: "pending" | "processing" | "completed" | "rejected"; created_at: string }>;
    }
  }

  const requestTemplate = `Request Type: account|records\nData Scope: <what to delete>\nReason: <brief reason>\nConfirmation: I understand this request may be irreversible.`;

  return (
    <main className="container-narrow min-h-screen pt-28 pb-24">
      <header>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          Curvio
        </p>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight">
          {messages.privacy.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">{messages.privacy.lead}</p>
      </header>

      <section className="mt-12 grid gap-4">
        <Card>
          <div className="flex gap-4">
            <Shield className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.purposeTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.purposeBody}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <Eye className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.scopeTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.scopeBody}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <Trash2 className="mt-1 h-5 w-5 shrink-0 text-tertiary" />
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.deleteTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.deleteBody}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <FileText className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div className="w-full">
              <h2 className="text-2xl font-medium">{messages.privacy.requestTitle}</h2>
              <p className="mt-4 leading-7 text-muted">{messages.privacy.requestLead}</p>

              {requested ? (
                <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                  {messages.privacy.requestSuccess}
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
                  {decodeURIComponent(error)}
                </p>
              ) : null}

              <details className="mt-5 rounded-lg border border-border-subtle bg-surface-container-low/50 p-4">
                <summary className="cursor-pointer text-sm font-medium text-primary">
                  {messages.privacy.templateToggle}
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-md bg-surface-offwhite p-3 text-xs leading-6 text-muted">
{requestTemplate}
                </pre>
              </details>

              {user ? (
                <form action={submitDeletionRequestAction} className="mt-5 space-y-3">
                  <input name="locale" type="hidden" value={locale} />
                  <label className="block space-y-2 text-sm font-medium">
                    {messages.privacy.requestFormLabel}
                    <textarea
                      className="min-h-36 w-full rounded-lg border border-border-subtle bg-surface-offwhite px-3 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-0"
                      defaultValue={requestTemplate}
                      name="request_content"
                      required
                    />
                  </label>
                  <button className="inline-flex h-10 items-center justify-center rounded-lg border border-border-subtle bg-surface-offwhite px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-container-low" type="submit">
                    {messages.privacy.requestSubmit}
                  </button>
                </form>
              ) : (
                <p className="mt-5 text-sm text-muted">
                  {messages.privacy.requestLoginHint}{" "}
                  <Link className="text-primary hover:text-primary-strong" href={localizePath(locale, "/login")}>
                    {messages.nav.signIn}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </Card>

        {user ? (
          <Card>
            <div>
              <h2 className="text-2xl font-medium">{messages.privacy.historyTitle}</h2>
              {historyError ? (
                <p className="mt-4 rounded-lg border border-border-subtle bg-surface-container-low px-3 py-2 text-sm text-muted">
                  {historyError}
                </p>
              ) : historyRows.length === 0 ? (
                <p className="mt-4 text-sm text-muted">{messages.privacy.historyEmpty}</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {historyRows.map((row) => (
                    <li className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-offwhite px-3 py-2" key={row.id}>
                      <div>
                        <p className="text-sm font-medium text-foreground">#{row.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted">{new Date(row.created_at).toLocaleString(locale)}</p>
                      </div>
                      <span className="rounded-full bg-surface-container px-2 py-1 text-xs font-medium text-primary">
                        {row.status === "pending"
                          ? messages.privacy.statusPending
                          : row.status === "processing"
                            ? messages.privacy.statusProcessing
                            : row.status === "completed"
                              ? messages.privacy.statusCompleted
                              : messages.privacy.statusRejected}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
