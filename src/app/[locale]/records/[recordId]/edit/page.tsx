import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ locale: string; recordId: string }>;
}) {
  const { locale: rawLocale, recordId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  redirect(`/${locale}/dashboard/records/${recordId}/edit`);
}
