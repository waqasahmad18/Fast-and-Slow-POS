import { notFound } from "next/navigation";
import { AtlasDown } from "@/components/atlas-down";
import { PrintBill } from "@/components/print-bill";
import { getBillContext } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await runStoreQuery(() => getBillContext(id));
  if (!result.ok) return <AtlasDown message={result.message} />;
  const data = result.data;
  if (!data) notFound();
  return <PrintBill {...data} />;
}
