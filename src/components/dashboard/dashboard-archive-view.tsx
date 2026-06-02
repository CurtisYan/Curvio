import { Pencil, Trash2 } from "lucide-react";
import { deleteRecordAction } from "@/app/dashboard-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { RecordCard } from "@/components/records/record-card";
import { localizePath, type Locale } from "@/lib/i18n";
import { formatRecordPublicId } from "@/lib/record-public-id";

type DashboardRecord = {
  id: string;
  type: "donation" | "kindness" | "open_source";
  title: string;
  content: string;
  date: string;
  is_anonymous: boolean;
  show_amount: boolean;
  amount: number | null;
  tags: string[] | null;
};

type ProfileSummary = {
  username: string;
  display_name: string;
};

type DashboardLabels = {
  all: string;
  records: string;
  projects: string;
  recordsTitle: string;
  recordsLead: string;
  projectsLead: string;
  overviewLead: string;
  recordsEmpty: string;
  projectsEmpty: string;
  editRecord: string;
  deleteRecord: string;
  deleteRecordTitle: string;
  deleteRecordLead: string;
  deleteRecordConfirm: string;
  deleteRecordSubmit: string;
  deleteRecordDeleted: string;
  deleteRecordError: string;
  anonymous: string;
  recordDonation: string;
  recordKindness: string;
  recordOpenWork: string;
};

export function DashboardArchiveView({
  locale,
  labels,
  profile,
  records,
  mode,
  status,
}: {
  locale: Locale;
  labels: DashboardLabels;
  profile: ProfileSummary;
  records: DashboardRecord[];
  mode: "overview" | "records" | "projects";
  status?: string;
}) {
  const recordTypeLabels = {
    donation: labels.recordDonation,
    kindness: labels.recordKindness,
    open_source: labels.recordOpenWork,
  } as const;

  const mappedRecords = records.map((record) => ({
    id: record.id,
    type: record.type,
    title: record.title,
    content: record.content,
    date: record.date,
    authorUsername: profile.username,
    authorDisplayName: profile.display_name,
    isAnonymous: record.is_anonymous,
    amountHidden: !record.show_amount && Boolean(record.amount),
    tags: record.tags ?? [],
    language: locale,
  }));

  const renderList = (items: DashboardRecord[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-border-subtle bg-surface-container-low px-6 py-8 text-sm text-muted">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((record) => {
          const publicRecordId = formatRecordPublicId(record.date, record.id);

          return (
            <div className="space-y-3" key={record.id}>
              <RecordCard
                anonymousLabel={labels.anonymous}
                locale={locale}
                record={
                  mappedRecords.find((item) => item.id === record.id) ?? {
                    id: record.id,
                    type: record.type,
                    title: record.title,
                    content: record.content,
                    date: record.date,
                    authorUsername: profile.username,
                    authorDisplayName: profile.display_name,
                    isAnonymous: record.is_anonymous,
                    amountHidden: !record.show_amount && Boolean(record.amount),
                    tags: record.tags ?? [],
                    language: locale,
                  }
                }
                typeLabels={recordTypeLabels}
              />
              <div className="grid gap-2">
                <ButtonLink
                  className="w-full"
                  href={localizePath(locale, `/dashboard/records/${publicRecordId}/edit`)}
                  variant="secondary"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {labels.editRecord}
                </ButtonLink>
                <details className="rounded-lg border border-error/20 bg-error/5 px-3 py-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-error marker:hidden">
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      {labels.deleteRecord}
                    </span>
                    <span className="text-xs font-normal text-muted">{labels.deleteRecordTitle}</span>
                  </summary>
                  <form action={deleteRecordAction} className="mt-3 space-y-3 border-t border-error/15 pt-3">
                    <input name="locale" type="hidden" value={locale} />
                    <input name="record_id" type="hidden" value={record.id} />
                    <input
                      name="return_path"
                      type="hidden"
                      value={
                        mode === "records"
                          ? "dashboard/records"
                          : mode === "projects"
                            ? "dashboard/projects"
                            : "dashboard"
                      }
                    />
                    <p className="text-xs leading-5 text-muted">{labels.deleteRecordLead}</p>
                    <label className="flex items-start gap-2 rounded-md border border-error/15 bg-surface-offwhite px-3 py-2 text-xs leading-5 text-muted">
                      <input
                        className="mt-0.5 h-4 w-4 rounded border-border-subtle accent-error"
                        name="confirm_delete"
                        required
                        type="checkbox"
                        value="1"
                      />
                      {labels.deleteRecordConfirm}
                    </label>
                    <Button className="h-10 w-full" type="submit" variant="danger">
                      {labels.deleteRecordSubmit}
                    </Button>
                  </form>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const recordItems = records.filter((record) => record.type !== "open_source");
  const projectItems = records.filter((record) => record.type === "open_source");

  return (
    <main className="container-page min-h-screen pt-28 pb-24">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {mode === "overview" ? labels.all : mode === "records" ? labels.recordsTitle : labels.projects}
          </h1>
          <p className="mt-3 text-muted">
            {mode === "overview"
              ? labels.overviewLead
              : mode === "records"
                ? labels.recordsLead
                : labels.projectsLead}
          </p>
        </div>

        {status === "deleted" ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.deleteRecordDeleted}
          </div>
        ) : null}
        {status === "delete_error" ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {labels.deleteRecordError}
          </div>
        ) : null}

        {mode !== "projects" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-medium">{labels.records}</h2>
            </div>
            {renderList(recordItems, labels.recordsEmpty)}
          </section>
        ) : null}

        {mode === "overview" || mode === "projects" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-medium">{labels.projects}</h2>
            </div>
            {renderList(projectItems, labels.projectsEmpty)}
          </section>
        ) : null}
      </div>
    </main>
  );
}
