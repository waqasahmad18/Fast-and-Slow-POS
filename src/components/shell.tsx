"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "New bill", icon: ShoppingBag },
  { href: "/orders", label: "Bills", icon: ClipboardList },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Shell({ children }: { restaurantName: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-espresso text-cream lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between gap-3 px-4 py-5 lg:block">
          <BrandMark />
          <nav className="flex gap-1 overflow-x-auto lg:mt-8 lg:block lg:space-y-1">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
                    active ? "bg-gold text-white" : "text-cream/70 hover:bg-white/10 hover:text-cream"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-6">{children}</main>
    </div>
  );
}
