import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function readHtmlAttributes(value: string) {
  const attrs: Record<string, string> = {};
  const attrPattern = /([a-zA-Z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(value))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  return attrs;
}

function escapeMarkdownText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/]/g, "\\]");
}

function escapeMarkdownTitle(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function readImageScale(alt: string) {
  const match = alt.match(/^(.*?)(?:\|(?:(?:\d+)x(?:\d+),\s*)?(25|50|75|100)%)$/);

  return {
    altText: match ? match[1] : alt,
    scale: match ? Number(match[2]) : undefined,
  };
}

function normalizeImageHtml(markdown: string) {
  return markdown.replace(/<img\b[^>]*>/gi, (tag) => {
    const attrs = readHtmlAttributes(tag);
    const src = attrs.src;

    if (!src) {
      return "";
    }

    const alt = escapeMarkdownText(attrs.alt ?? "");
    const width = attrs.width && /^\d+$/.test(attrs.width) ? attrs.width : "";
    const title = width ? `curvio-width:${width}` : attrs.title ?? "";
    const titlePart = title ? ` "${escapeMarkdownTitle(title)}"` : "";

    return `![${alt}](${src}${titlePart})`;
  });
}

const markdownComponents: Components = {
  a: ({ className, ...props }) => (
    <a
      className={cn("text-primary underline underline-offset-4 transition-opacity hover:opacity-75", className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("border-l border-border-subtle pl-4 text-muted", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded-md bg-surface-container-low px-1.5 py-0.5 font-mono text-[0.9em] text-foreground",
        className,
      )}
      {...props}
    />
  ),
  h1: ({ className, ...props }) => (
    <h2 className={cn("text-2xl font-semibold tracking-tight text-foreground", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h3 className={cn("text-xl font-semibold tracking-tight text-foreground", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h4 className={cn("text-lg font-medium text-foreground", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-6 border-border-subtle", className)} {...props} />
  ),
  img: ({ alt, className, src, title, ...props }) => {
    if (typeof src !== "string" || !src) {
      return null;
    }

    const { altText, scale } = readImageScale(typeof alt === "string" ? alt : "");
    const width = typeof title === "string" ? title.match(/^curvio-width:(\d+)$/)?.[1] : undefined;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={altText}
        className={cn(
          "mx-auto my-5 max-h-[520px] w-auto max-w-full rounded-xl border border-border-subtle bg-surface-container-low object-contain",
          className,
        )}
        loading="lazy"
        src={src}
        style={scale ? { width: `${scale}%` } : width ? { width: `${width}px` } : undefined}
        title={width ? undefined : title}
        {...props}
      />
    );
  },
  li: ({ className, ...props }) => <li className={cn("pl-1", className)} {...props} />,
  ol: ({ className, ...props }) => (
    <ol className={cn("list-decimal space-y-1 pl-5", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("text-base leading-7 text-on-surface-variant", className)} {...props} />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-border-subtle bg-surface-container-low p-3 text-sm",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  td: ({ className, ...props }) => (
    <td className={cn("border border-border-subtle px-3 py-2", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn("border border-border-subtle bg-surface-container-low px-3 py-2 text-left font-medium", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("list-disc space-y-1 pl-5", className)} {...props} />
  ),
};

export function RecordMarkdown({
  children,
  className,
  imagePreviewUrls,
}: {
  children: string;
  className?: string;
  imagePreviewUrls?: Record<string, string>;
}) {
  const markdown = normalizeImageHtml(imagePreviewUrls
    ? children.replace(/curvio-image:([a-zA-Z0-9_-]+)/g, (match, token: string) => imagePreviewUrls[token] ?? match)
    : children);

  return (
    <div className={cn("space-y-4", className)}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => (url.startsWith("blob:") ? url : defaultUrlTransform(url))}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
