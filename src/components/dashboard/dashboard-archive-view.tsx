import { ButtonLink } from "@/components/ui/button";
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
}: {
  locale: Locale;
  labels: DashboardLabels;
  profile: ProfileSummary;
  records: DashboardRecord[];
  mode: "overview" | "records" | "projects";
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
              <ButtonLink
                className="w-full"
                href={localizePath(locale, `/dashboard/records/${publicRecordId}/edit`)}
                variant="secondary"
              >
                {labels.editRecord}
              </ButtonLink>
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