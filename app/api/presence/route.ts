import { NextResponse } from "next/server";

/* Graceful fallback — if KV env vars are missing, the endpoint still works
   but returns 0 so the widget simply hides itself. */
async function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

const KEY = "bk:presence";
const TTL = 35; // seconds — client pings every 30 s

/* GET — return current viewer count */
export async function GET() {
  const kv = await getKv();
  if (!kv) return NextResponse.json({ count: 0 });
  const count = (await kv.scard(KEY)) ?? 0;
  return NextResponse.json({ count });
}

/* POST — register this visitor (body: { id }) */
export async function POST(req: Request) {
  const kv = await getKv();
  if (!kv) return NextResponse.json({ ok: true });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await kv.sadd(KEY, id);
  await kv.expire(KEY, TTL);
  return NextResponse.json({ ok: true });
}

/* DELETE — remove this visitor */
export async function DELETE(req: Request) {
  const kv = await getKv();
  if (!kv) return NextResponse.json({ ok: true });
  const { id } = await req.json();
  if (id) await kv.srem(KEY, id);
  return NextResponse.json({ ok: true });
}
