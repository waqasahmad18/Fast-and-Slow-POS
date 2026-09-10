"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { payOrder, voidOrder } from "@/lib/actions";
import type { OrderStatus } from "@/lib/types";

export function BillActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/orders/${orderId}/print`}
        target="_blank"
        rel="noreferrer"
        className="rounded-2xl bg-gold px-4 text-sm font-semibold text-white"
      >
        Print bill
      </a>
      {status === "open" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await payOrder(orderId, "cash");
              router.refresh();
            })
          }
          className="rounded-2xl bg-panel px-4 text-sm"
        >
          Take cash
        </button>
      ) : null}
      {status !== "void" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await voidOrder(orderId);
              router.refresh();
            })
          }
          className="rounded-2xl bg-rose/20 px-4 text-sm text-rose"
        >
          Void
        </button>
      ) : null}
    </div>
  );
}
