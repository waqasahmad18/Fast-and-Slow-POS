"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-ink">
      <div className="max-w-lg rounded-[28px] border border-line bg-panel p-6 text-center">
        <h1 className="font-display text-3xl">POS could not load</h1>
        <p className="mt-3 text-sm text-muted">
          Live data comes from MongoDB Atlas. If this page appears, Cluster0 may be paused or the
          database user password in <code>MONGODB_URI</code> does not match Atlas. Reset that
          password in Database Access, update Vercel env vars, then Redeploy.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
