import { AtlasDown } from "@/components/atlas-down";
import { OrdersBoard } from "@/components/orders-board";
import { loadOrders } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const result = await runStoreQuery(loadOrders);
  if (!result.ok) return <AtlasDown message={result.message} />;
  return <OrdersBoard orders={result.data} />;
}
