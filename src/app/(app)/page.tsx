import { AtlasDown } from "@/components/atlas-down";
import { DashboardView } from "@/components/dashboard-view";
import { loadDashboard } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const result = await runStoreQuery(loadDashboard);
  if (!result.ok) return <AtlasDown message={result.message} />;
  return <DashboardView {...result.data} />;
}
