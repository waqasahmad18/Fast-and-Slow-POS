import { SettingsForm } from "@/components/settings-form";
import { loadSettings } from "@/lib/queries";

export default async function SettingsPage() {
  const settings = await loadSettings();
  return <SettingsForm {...settings} />;
}
