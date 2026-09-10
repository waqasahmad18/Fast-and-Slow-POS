import { DashboardView } from "@/components/dashboard-view";
import { loadDashboard } from "@/lib/queries";

export default async function DashboardPage() {
  const data = await loadDashboard();
  return <DashboardView {...data} />;
}
