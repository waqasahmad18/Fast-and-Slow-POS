"use client";

import { useEffect } from "react";
import { Receipt } from "@/components/receipt";
import type { Order } from "@/lib/types";

export function PrintBill({
  order,
  restaurantName,
  address,
  phone,
}: {
  order: Order;
  restaurantName: string;
  address: string;
  phone: string;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-200 text-black">
      <div className="no-print mx-auto flex max-w-[80mm] justify-center gap-2 py-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-neutral-900 px-4 text-sm text-white"
        >
          Print again
        </button>
        <button type="button" onClick={() => window.close()} className="rounded-xl bg-white px-4 text-sm">
          Close
        </button>
      </div>
      <Receipt order={order} restaurantName={restaurantName} address={address} phone={phone} />
    </div>
  );
}
