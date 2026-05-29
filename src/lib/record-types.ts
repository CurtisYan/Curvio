import type { RecordType } from "@/lib/types";

const recordTypeSegments: Record<RecordType, string> = {
  donation: "donations",
  kindness: "kindness",
  open_source: "open-source",
};

export type RecordTypeSegment = (typeof recordTypeSegments)[RecordType];

export function recordTypeToSegment(type: RecordType): RecordTypeSegment {
  return recordTypeSegments[type];
}

export function segmentToRecordType(segment: string): RecordType | null {
  if (segment === "donations") {
    return "donation";
  }

  if (segment === "kindness") {
    return "kindness";
  }

  if (segment === "open-source") {
    return "open_source";
  }

  return null;
}
