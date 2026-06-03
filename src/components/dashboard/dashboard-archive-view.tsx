import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { deleteRecordAction, restoreRecordAction } from "@/app/dashboard-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { RecordCard } from "@/components/records/record-card";
import { localizePath, type Locale } from "@/lib/i18n";
import { formatRecordPublicId } from "@/lib/record-public-id";
import { recordTypeToSegment } from "@/lib/record-types";

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
  archived_at: string | null;
};

type ProfileSummary = {
  username: string;
  display_name: string;
};

type DashboardLabels = {
  all: string;
  donations: string;
  acts: string;
  openWork: string;
  donationsLead: string;
  actsLead: string;
  openWorkLead: string;
  projectsLead: string;
  overviewLead: string;
  donationsEmpty: string;
  actsEmpty: string;
  openWorkEmpty: string;
  editRecord: string;
  openRecord: string;
  activeRecords: string;
  archivedRecords: string;
  archivedLead: string;
  archivedEmpty: string;
  restoreRecord: string;
  restoreRecordDone: string;
  archiveRecordDone: string;
  deleteRecord: string;
  deleteRecordTitle: string;
  deleteRecordLead: string;
  deleteRecordConfirm: string;
  deleteRecordSubmit: string;
  deleteRecordDeleted: string;
  manageRecordError: string;
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
  mode: "overview" | "donations" | "acts" | "projects";
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

  const returnPath =
    mode === "projects"
      ? "dashboard/projects"
      : mode === "donations"
        ? "dashboard/donations"
        : mode === "acts"
          ? "dashboard/acts"
          : "dashboard";

  const renderList = (
    items: DashboardRecord[],
    emptyMessage: string,
    options?: { archived?: boolean },
  ) => {
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
              <div className="flex items-center justify-end gap-3 px-1">
                <ButtonLink
                  className="h-8 border-transparent bg-transparent px-2 text-xs text-muted hover:text-primary"
                  href={localizePath(
                    locale,
                    `/u/${profile.username}/${recordTypeToSegment(record.type)}/${publicRecordId}`,
                  )}
                  variant="ghost"
                >
                  {labels.openRecord}
                </ButtonLink>
                {options?.archived ? (
                  <form action={restoreRecordAction}>
                    <input name="locale" type="hidden" value={locale} />
                    <input name="record_id" type="hidden" value={record.id} />
                    <input name="return_path" type="hidden" value={returnPath} />
                    <Button className="h-8 border-transparent bg-transparent px-2 text-xs text-muted hover:text-primary" type="submit" variant="ghost">
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      {labels.restoreRecord}
                    </Button>
                  </form>
                ) : null}
                {options?.archived ? (
                  <details className="relative">
                    <summary className="flex h-8 cursor-pointer list-none items-center gap-1 rounded-lg px-2 text-xs text-muted transition-colors hover:bg-error/5 hover:text-error marker:hidden">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {labels.deleteRecord}
                    </summary>
                    <form action={deleteRecordAction} className="absolute right-0 z-10 mt-2 w-72 space-y-3 rounded-lg border border-error/20 bg-surface-offwhite p-3 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="record_id" type="hidden" value={record.id} />
                      <input name="return_path" type="hidden" value={returnPath} />
                      <p className="text-xs leading-5 text-muted">{labels.deleteRecordLead}</p>
                      <label className="flex items-start gap-2 rounded-md border border-error/15 bg-error/5 px-3 py-2 text-xs leading-5 text-muted">
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
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const activeRecords = records.filter((record) => !record.archived_at);
  const archivedRecords = records.filter((record) => record.archived_at);
  const donationItems = activeRecords.filter((record) => record.type === "donation");
  const actItems = activeRecords.filter((record) => record.type === "kindness");
  const projectItems = activeRecords.filter((record) => record.type === "open_source");
  const archivedItems =
    mode === "donations"
      ? archivedRecords.filter((record) => record.type === "donation")
      : mode === "acts"
        ? archivedRecords.filter((record) => record.type === "kindness")
      : mode === "projects"
        ? archivedRecords.filter((record) => record.type === "open_source")
        : archivedRecords;

  return (
    <div className="pb-24">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {mode === "overview"
              ? labels.all
              : mode === "donations"
                ? labels.donations
                : mode === "acts"
                  ? labels.acts
                  : labels.openWork}
          </h1>
          <p className="mt-3 text-muted">
            {mode === "overview"
              ? labels.overviewLead
              : mode === "donations"
                ? labels.donationsLead
                : mode === "acts"
                  ? labels.actsLead
                  : labels.openWorkLead}
          </p>
        </div>

        {status === "deleted" ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.deleteRecordDeleted}
          </div>
        ) : null}
        {status === "archived" ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.archiveRecordDone}
          </div>
        ) : null}
        {status === "restored" ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {labels.restoreRecordDone}
          </div>
        ) : null}
        {status === "manage_error" ? (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {labels.manageRecordError}
          </div>
        ) : null}

        {mode === "overview" || mode === "donations" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-medium">{labels.donations}</h2>
            </div>
            {renderList(donationItems, labels.donationsEmpty)}
          </section>
        ) : null}

        {mode === "overview" || mode === "acts" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-medium">{labels.acts}</h2>
            </div>
            {renderList(actItems, labels.actsEmpty)}
          </section>
        ) : null}

        {mode === "overview" || mode === "projects" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-medium">{labels.openWork}</h2>
            </div>
            {renderList(projectItems, labels.openWorkEmpty)}
          </section>
        ) : null}

        <section className="space-y-4 border-t border-border-subtle pt-8">
          <div className="flex items-center gap-3">
            <Archive className="h-5 w-5 text-muted" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-medium">{labels.archivedRecords}</h2>
              <p className="mt-1 text-sm text-muted">{labels.archivedLead}</p>
            </div>
          </div>
          {renderList(archivedItems, labels.archivedEmpty, { archived: true })}
        </section>
      </div>
    </div>
  );
}
