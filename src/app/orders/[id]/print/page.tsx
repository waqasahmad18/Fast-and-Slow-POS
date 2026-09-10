import { notFound } from "next/navigation";
import { PrintBill } from "@/components/print-bill";
import { getBillContext } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "bom1";
export const maxDuration = 60;

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getBillContext(id);
  if (!data) notFound();
  return <PrintBill {...data} />;
}
