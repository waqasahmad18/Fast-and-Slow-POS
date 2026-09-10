import { notFound } from "next/navigation";
import { PrintBill } from "@/components/print-bill";
import { getBillContext } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getBillContext(id);
  if (!data) notFound();
  return <PrintBill {...data} />;
}
