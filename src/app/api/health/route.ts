import { NextResponse } from "next/server";
import { tryGetDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uri = process.env.MONGODB_URI?.trim() ?? "";
  try {
    const db = await tryGetDb();
    if (!db) {
      return NextResponse.json(
        {
          ok: false,
          hasUri: Boolean(uri),
          srv: uri.startsWith("mongodb+srv://"),
          error: "MongoDB client did not connect.",
        },
        { status: 500 }
      );
    }
    await db.command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      hasUri: true,
      srv: uri.startsWith("mongodb+srv://"),
      db: process.env.MONGODB_DB ?? "fast_and_slow_pos",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        hasUri: Boolean(uri),
        srv: uri.startsWith("mongodb+srv://"),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
