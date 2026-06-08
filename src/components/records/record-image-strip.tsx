import type { GoodwillRecord } from "@/lib/types";

export function RecordImageStrip({
  images,
  size = "sm",
}: {
  images?: GoodwillRecord["images"];
  size?: "sm" | "md" | "lg";
}) {
  const sortedImages = (images ?? []).slice().sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return 0;
  });
  const visibleImages = sortedImages.slice(0, 4);
  const extraImageCount = Math.max(sortedImages.length - visibleImages.length, 0);

  if (visibleImages.length === 0) {
    return null;
  }

  const sizeClass = {
    sm: "h-14 w-14",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  }[size];

  return (
    <div className="flex gap-2">
      {visibleImages.map((image, index) => {
        const isLastWithMore = index === visibleImages.length - 1 && extraImageCount > 0;

        return (
          <div
            className={`relative ${sizeClass} overflow-hidden rounded-lg border border-border-subtle bg-surface-container-low`}
            key={image.id}
          >
            <img
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              src={image.url}
            />
            {isLastWithMore ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white">
                +{extraImageCount}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
