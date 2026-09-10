import { PosTerminal } from "@/components/pos-terminal";
import { loadPosData } from "@/lib/queries";

export default async function PosPage() {
  const data = await loadPosData();
  return <PosTerminal taxRate={data.taxRate} menu={data.menu} tables={data.tables} orders={data.orders} />;
}
