import { AtlasDown } from "@/components/atlas-down";
import { PosTerminal } from "@/components/pos-terminal";
import { loadPosData } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export default async function PosPage() {
  const result = await runStoreQuery(loadPosData);
  if (!result.ok) return <AtlasDown message={result.message} />;
  const data = result.data;
  return <PosTerminal taxRate={data.taxRate} menu={data.menu} tables={data.tables} orders={data.orders} />;
}
