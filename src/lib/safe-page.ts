export async function runStoreQuery<T>(
  fn: () => Promise<T>
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not read MongoDB Atlas.",
    };
  }
}
