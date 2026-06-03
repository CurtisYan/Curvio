import { Badge } from "@/components/ui/badge";
import type { RecordType } from "@/lib/types";
import { RecordIcon } from "./record-icon";
import { recordLabel } from "./record-label";

export function RecordTypeBadge({
  className,
  label,
  type,
}: {
  className?: string;
  label?: string;
  type: RecordType;
}) {
  return (
    <Badge className={className}>
      <RecordIcon className="h-3.5 w-3.5" type={type} />
      {label ?? recordLabel(type)}
    </Badge>
  );
}
