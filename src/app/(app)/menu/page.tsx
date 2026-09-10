import { AtlasDown } from "@/components/atlas-down";
import { MenuManager } from "@/components/menu-manager";
import { loadMenu } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export default async function MenuPage() {
  const result = await runStoreQuery(loadMenu);
  if (!result.ok) return <AtlasDown message={result.message} />;
  return <MenuManager menu={result.data} />;
}
