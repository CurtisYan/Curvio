import { redirect } from "next/navigation";

export default async function VerifyRegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  redirect(`/en/register/verify${email ? `?email=${encodeURIComponent(email)}` : ""}`);
}
