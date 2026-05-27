import { Code2, HandHeart, Sprout } from "lucide-react";
import type { RecordType } from "@/lib/types";

export function RecordIcon({ type, className }: { type: RecordType; className?: string }) {
  if (type === "donation") {
    return <HandHeart className={className} />;
  }

  if (type === "open_source") {
    return <Code2 className={className} />;
  }

  return <Sprout className={className} />;
}
