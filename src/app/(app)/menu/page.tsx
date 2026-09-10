import { MenuManager } from "@/components/menu-manager";
import { loadMenu } from "@/lib/queries";

export default async function MenuPage() {
  const menu = await loadMenu();
  return <MenuManager menu={menu} />;
}
