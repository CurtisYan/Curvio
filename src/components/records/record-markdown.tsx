import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

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
  img: ({ alt, className, src, ...props }) => {
    if (typeof src !== "string" || !src) {
      return null;
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={typeof alt === "string" ? alt : ""}
        className={cn(
          "my-4 w-full rounded-xl border border-border-subtle bg-surface-container-low object-cover",
          className,
        )}
        loading="lazy"
        src={src}
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
  const markdown = imagePreviewUrls
    ? children.replace(/curvio-image:([a-zA-Z0-9_-]+)/g, (match, token: string) => imagePreviewUrls[token] ?? match)
    : children;

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
