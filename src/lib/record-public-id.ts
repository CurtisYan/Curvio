export function formatRecordPublicId(recordDate: string, recordId: string) {
  const datePrefix = recordDate.replace(/-/g, "");
  return `${datePrefix}-${recordId}`;
}

export function resolveRecordId(recordId: string) {
  const match = recordId.match(/^\d{8}-(.+)$/);
  return match?.[1] ?? recordId;
}