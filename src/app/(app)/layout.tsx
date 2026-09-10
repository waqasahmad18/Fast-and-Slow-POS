import { Shell } from "@/components/shell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
