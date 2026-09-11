import type { OrderStatus, OrderType, PaymentMethod } from "./types";

export const PKR = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function money(value: number) {
  return PKR.format(value);
}

export function clock(iso: string) {
  return new Date(iso).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function taxLabel(rate: number) {
  return `${Math.round(rate * 100)}%`;
}

export const typeLabel: Record<OrderType, string> = {
  "dine-in": "Dine in",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

export const statusLabel: Record<OrderStatus, string> = {
  open: "Open",
  paid: "Paid",
  void: "Void",
};

export const payLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
};
