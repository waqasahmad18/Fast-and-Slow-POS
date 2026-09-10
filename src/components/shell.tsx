"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  X,
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

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
              active ? "bg-gold text-white" : "text-cream/70 hover:bg-white/10 hover:text-cream"
            }`}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Shell({ children }: { restaurantName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-espresso px-3 py-3 text-cream lg:hidden">
        <BrandMark size="sm" />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-cream"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,300px)] flex-col bg-espresso text-cream shadow-2xl transition-transform duration-200 lg:relative lg:inset-auto lg:z-auto lg:min-h-full lg:w-auto lg:translate-x-0 lg:self-stretch lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full min-h-dvh flex-col overflow-y-auto px-4 py-5 lg:sticky lg:top-0 lg:h-dvh lg:min-h-0">
          <div className="mb-6 hidden lg:block">
            <BrandMark />
          </div>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BrandMark size="sm" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <main className="min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-6">{children}</main>
    </div>
  );
}
