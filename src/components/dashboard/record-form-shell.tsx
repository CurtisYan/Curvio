import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { AmountVisibilityField } from "./amount-visibility-field";

export function RecordFormShell({
  title,
  note,
  labels,
}: {
  title: string;
  note: string;
  labels: {
    typeDonation: string;
    typeKindness: string;
    typeOpenSource: string;
    fieldTitle: string;
    fieldDate: string;
    fieldDescription: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    visibilityPublic: string;
    hideAmount: string;
    anonymous: string;
    saveDraft: string;
    amount: string;
    currency: string;
    amountPlaceholder: string;
    amountVisible: string;
    amountHidden: string;
  };
}) {
  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{labels.typeDonation}</Badge>
        <Badge>{labels.typeKindness}</Badge>
        <Badge>{labels.typeOpenSource}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          {labels.fieldTitle}
          <Input placeholder={labels.titlePlaceholder} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          {labels.fieldDate}
          <Input aria-label={labels.fieldDate} type="date" />
        </label>
      </div>
      <label className="space-y-2 text-sm font-medium">
        {labels.fieldDescription}
        <Textarea placeholder={labels.descriptionPlaceholder} />
      </label>
      <AmountVisibilityField labels={labels} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low p-3 text-sm">
          <input type="checkbox" />
          {labels.visibilityPublic}
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low p-3 text-sm">
          <input type="checkbox" />
          {labels.anonymous}
        </label>
      </div>
      <Button disabled type="button">
        {labels.saveDraft}
      </Button>
    </Card>
  );
}
