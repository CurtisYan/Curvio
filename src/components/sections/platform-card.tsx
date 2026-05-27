import { ArrowUpRight, Building2, HandHeart, HeartPulse, Wheat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import type { DonationPlatform } from "@/lib/types";

const icons = {
  unicef: Building2,
  icrc: HeartPulse,
  wfp: Wheat,
  tencent: HandHeart,
};

export function PlatformCard({
  locale,
  platform,
  visitLabel,
}: {
  locale: Locale;
  platform: DonationPlatform;
  visitLabel: string;
}) {
  const Icon = icons[platform.id as keyof typeof icons] ?? Building2;
  const officialUrl = platform.officialUrls?.[locale] ?? platform.officialUrl;

  return (
    <Card className="flex min-h-[250px] flex-col justify-between">
      <div>
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-medium">{platform.name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{platform.description}</p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{platform.region}</Badge>
          {platform.languages.map((language) => (
            <Badge key={language}>{language}</Badge>
          ))}
        </div>
        <a
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-strong"
          href={officialUrl}
          rel="noreferrer"
          target="_blank"
        >
          {visitLabel}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
