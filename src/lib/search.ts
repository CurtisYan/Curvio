export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export function matchesSearchQuery(fields: Array<string | null | undefined>, query: string) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => field?.toLowerCase().includes(normalizedQuery));
}

export function buildSearchSnippet(text: string, query: string, maxLength = 140) {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    return "";
  }

  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return normalizedText.length > maxLength ? `${normalizedText.slice(0, maxLength)}…` : normalizedText;
  }

  const matchIndex = normalizedText.toLowerCase().indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return normalizedText.length > maxLength ? `${normalizedText.slice(0, maxLength)}…` : normalizedText;
  }

  const lead = 48;
  const tail = Math.max(56, maxLength - lead - normalizedQuery.length);
  const start = Math.max(0, matchIndex - lead);
  const end = Math.min(normalizedText.length, matchIndex + normalizedQuery.length + tail);

  return `${start > 0 ? "…" : ""}${normalizedText.slice(start, end)}${end < normalizedText.length ? "…" : ""}`;
}

export function splitHighlightedText(text: string, query: string) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [{ text, highlighted: false }];
  }

  const lowerText = text.toLowerCase();
  const segments: Array<{ text: string; highlighted: boolean }> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(normalizedQuery, cursor);

    if (matchIndex === -1) {
      const remaining = text.slice(cursor);

      if (remaining) {
        segments.push({ text: remaining, highlighted: false });
      }

      break;
    }

    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlighted: false });
    }

    segments.push({
      text: text.slice(matchIndex, matchIndex + normalizedQuery.length),
      highlighted: true,
    });
    cursor = matchIndex + normalizedQuery.length;
  }

  return segments.length > 0 ? segments : [{ text, highlighted: false }];
}