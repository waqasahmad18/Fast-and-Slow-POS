import { clock, money, payLabel, taxLabel, typeLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

export function Receipt({
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
  return (
    <article className="receipt mx-auto w-[80mm] bg-white p-4 text-black">
      <header className="border-b border-dashed border-neutral-400 pb-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em]">Fast & Slow</p>
        <h1 className="font-display text-xl font-semibold tracking-tight">{restaurantName}</h1>
        <p className="text-[11px] italic">Quick plates. Slow cooking.</p>
        {address ? <p className="mt-1 text-xs">{address}</p> : null}
        {phone ? <p className="text-xs">Tel: {phone}</p> : null}
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em]">Sales receipt</p>
      </header>

      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <dt>Bill</dt>
          <dd className="font-semibold">{order.billNo}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Date</dt>
          <dd>{clock(order.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Type</dt>
          <dd>
            {typeLabel[order.type]}
            {order.tableName ? ` · ${order.tableName}` : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Status</dt>
          <dd className="uppercase">{order.status}</dd>
        </div>
      </dl>

      <table className="mt-3 w-full border-t border-dashed border-neutral-400 text-xs">
        <thead>
          <tr className="text-left">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={`${line.itemId}-${line.name}`}>
              <td className="py-1 pr-2">
                <div>{line.name}</div>
                <div className="text-[10px] text-neutral-600">{money(line.price)} each</div>
              </td>
              <td className="py-1 text-right align-top">{line.qty}</td>
              <td className="py-1 text-right align-top">{money(line.price * line.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 space-y-1 border-t border-dashed border-neutral-400 pt-2 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{money(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST {taxLabel(order.taxRate)}</span>
          <span>{money(order.tax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{money(order.total)}</span>
        </div>
        {order.paymentMethod ? (
          <div className="flex justify-between">
            <span>Paid by</span>
            <span>{payLabel[order.paymentMethod]}</span>
          </div>
        ) : null}
      </div>

      {order.note ? (
        <p className="mt-3 text-xs">
          <span className="font-semibold">Note: </span>
          {order.note}
        </p>
      ) : null}

      <footer className="mt-4 border-t border-dashed border-neutral-400 pt-3 text-center text-xs">
        <p>Shukriya! Please visit again.</p>
        <p className="mt-1 text-[10px] text-neutral-600">Fast and Slow Restaurant POS</p>
      </footer>
    </article>
  );
}
