import { InventoryBoard } from "@/components/inventory-board";
import { loadInventory } from "@/lib/queries";

export default async function InventoryPage() {
  const data = await loadInventory();
  return <InventoryBoard menu={data.menu} stockMoves={data.stockMoves} />;
}
