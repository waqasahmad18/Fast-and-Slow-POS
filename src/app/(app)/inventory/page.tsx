import { AtlasDown } from "@/components/atlas-down";
import { InventoryBoard } from "@/components/inventory-board";
import { loadInventory } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export default async function InventoryPage() {
  const result = await runStoreQuery(loadInventory);
  if (!result.ok) return <AtlasDown message={result.message} />;
  return <InventoryBoard menu={result.data.menu} stockMoves={result.data.stockMoves} />;
}
