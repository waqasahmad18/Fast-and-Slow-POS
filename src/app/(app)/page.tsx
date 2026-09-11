import { AtlasDown } from "@/components/atlas-down";
import { DashboardView } from "@/components/dashboard-view";
import { loadDashboard } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";
import { clampDayKey } from "@/lib/time";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dayKey = clampDayKey(params.date);
  const result = await runStoreQuery(() => loadDashboard(dayKey));
  if (!result.ok) return <AtlasDown message={result.message} />;
  return <DashboardView {...result.data} />;
}
