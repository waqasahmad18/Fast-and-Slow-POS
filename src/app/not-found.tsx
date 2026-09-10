import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Not found</p>
        <h1 className="font-display mt-2 text-4xl">This page does not exist</h1>
        <Link href="/" className="mt-6 inline-block rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
