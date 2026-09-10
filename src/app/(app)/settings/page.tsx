import { AtlasDown } from "@/components/atlas-down";
import { SettingsForm } from "@/components/settings-form";
import { loadSettings } from "@/lib/queries";
import { runStoreQuery } from "@/lib/safe-page";

export default async function SettingsPage() {
  const result = await runStoreQuery(loadSettings);
  if (!result.ok) return <AtlasDown message={result.message} />;
  return <SettingsForm {...result.data} />;
}
