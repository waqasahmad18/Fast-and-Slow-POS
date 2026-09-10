import Link from "next/link";
import { notFound } from "next/navigation";
import { Receipt } from "@/components/receipt";
import { BillActions } from "@/components/bill-actions";
import { getBillContext } from "@/lib/queries";

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getBillContext(id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/orders" className="text-sm text-gold-2 hover:underline">
            Back to bills
          </Link>
          <h2 className="font-display mt-1 text-4xl">{data.order.billNo}</h2>
        </div>
        <BillActions orderId={data.order.id} status={data.order.status} />
      </div>
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <Receipt
          order={data.order}
          restaurantName={data.restaurantName}
          address={data.address}
          phone={data.phone}
        />
      </div>
    </div>
  );
}
