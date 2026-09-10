import { OrdersBoard } from "@/components/orders-board";
import { loadOrders } from "@/lib/queries";

export default async function OrdersPage() {
  const orders = await loadOrders();
  return <OrdersBoard orders={orders} />;
}
