import { NextResponse } from "next/server";

const BASE  = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const KEY   = "bk:presence";
const TTL   = 35; // seconds — client re-pings every 30 s

async function redis(cmd: string[]) {
  if (!BASE || !TOKEN) return null;
  const res = await fetch(`${BASE}/${cmd.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  const json = await res.json();
  return json.result;
}

/* GET — current viewer count */
export async function GET() {
  const count = await redis(["scard", KEY]) ?? 0;
  return NextResponse.json({ count });
}

/* POST — register visitor { id } */
export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await redis(["sadd", KEY, id]);
  await redis(["expire", KEY, String(TTL)]);
  return NextResponse.json({ ok: true });
}

/* DELETE — remove visitor { id } */
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (id) await redis(["srem", KEY, id]);
  return NextResponse.json({ ok: true });
}
