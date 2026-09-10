import { Shell } from "@/components/shell";
import { getRestaurantName } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const restaurantName = await getRestaurantName();
  return <Shell restaurantName={restaurantName}>{children}</Shell>;
}
