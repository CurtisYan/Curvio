function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripQuery(value: string) {
  const index = value.indexOf("?");
  return index >= 0 ? value.slice(0, index) : value;
}

export function replaceImagePlaceholders(content: string, imageUrlsByToken: Map<string, string>) {
  return content.replace(/curvio-image:([a-zA-Z0-9_-]+)/g, (_match, token: string) => {
    return imageUrlsByToken.get(token) ?? "";
  });
}

export function removeMarkdownImageReferences(content: string, imageUrls: string[]) {
  const urls = Array.from(
    new Set(
      imageUrls
        .flatMap((url) => [url, stripQuery(url)])
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  );

  if (urls.length === 0) {
    return content;
  }

  const urlPattern = urls.map(escapeRegExp).join("|");
  const markdownImagePattern = new RegExp(
    String.raw`[ \t]*!\[[^\]\n]*\]\(\s*(?:${urlPattern})(?:\?[^)\s]*)?\s*\)[ \t]*`,
    "g",
  );

  return content
    .replace(markdownImagePattern, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
