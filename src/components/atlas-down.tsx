export function AtlasDown({ message }: { message: string }) {
  const authFail = /bad auth|authentication failed/i.test(message);

  return (
    <div className="mx-auto max-w-lg rounded-[28px] border border-line bg-panel p-6 text-ink">
      <h1 className="font-display text-3xl">Atlas is not connected</h1>
      {authFail ? (
        <p className="mt-3 text-sm text-muted">
          MongoDB Atlas rejected the database password in <code>MONGODB_URI</code>. Open Atlas →
          Database Access → user <code>vickyksr2218</code> → Edit Password. Put that same password
          in Vercel env vars and in <code>.env.local</code>, then Redeploy.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">{message}</p>
      )}
    </div>
  );
}
