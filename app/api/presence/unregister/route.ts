import { NextResponse } from "next/server";

const BASE  = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const KEY   = "bk:presence";

async function redis(cmd: string[]) {
  if (!BASE || !TOKEN) return null;
  const res = await fetch(`${BASE}/${cmd.map(encodeURIComponent).join("/")}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  const json = await res.json();
  return json.result;
}

export async function POST(req: Request) {
  const { id } = await req.json();
  if (id) await redis(["srem", KEY, id]);
  return NextResponse.json({ ok: true });
}
