import type { RecordType } from "@/lib/types";

export function recordLabel(type: RecordType) {
  if (type === "donation") {
    return "Donations";
  }

  if (type === "open_source") {
    return "Open Work";
  }

  return "Acts";
}
