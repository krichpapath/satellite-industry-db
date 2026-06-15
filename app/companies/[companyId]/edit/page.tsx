import { redirect } from "next/navigation";

export default async function EditCompanyAliasPage({
  params
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/firms/${companyId}/edit`);
}
