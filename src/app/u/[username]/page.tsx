import { redirect } from "next/navigation";

export default async function UserRedirect({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  redirect(`/en/u/${username}`);
}
