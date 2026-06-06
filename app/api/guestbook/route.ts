import { client }      from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";

const NAME_MAX = 50;
const MSG_MAX  = 280;
const LOC_MAX  = 60;

const QUERY = `
  *[_type == "guestbookEntry" && approved == true]
  | order(_createdAt desc)
  { _id, name, message, location, emoji, _createdAt }
`;

/* ── GET — list all approved entries ─────────────────────── */
export async function GET() {
  try {
    const entries = await client.fetch(QUERY, {}, { cache: "no-store" });
    return Response.json(entries);
  } catch {
    return Response.json([], { status: 200 });
  }
}

/* ── POST — submit a new entry ───────────────────────────── */
export async function POST(req: Request) {
  if (!process.env.SANITY_API_TOKEN) {
    return Response.json({ error: "Server not configured" }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, message, location, emoji } =
    body as { name?: string; message?: string; location?: string; emoji?: string };

  if (!name?.trim() || !message?.trim()) {
    return Response.json({ error: "Name and message are required" }, { status: 400 });
  }
  if (name.trim().length > NAME_MAX) {
    return Response.json({ error: `Name must be ≤ ${NAME_MAX} chars` }, { status: 400 });
  }
  if (message.trim().length > MSG_MAX) {
    return Response.json({ error: `Message must be ≤ ${MSG_MAX} chars` }, { status: 400 });
  }

  const doc = {
    _type:    "guestbookEntry",
    name:     name.trim().slice(0, NAME_MAX),
    message:  message.trim().slice(0, MSG_MAX),
    location: location?.trim().slice(0, LOC_MAX) || null,
    emoji:    emoji || "👋",
    approved: true,
  };

  try {
    const created = await writeClient.create(doc);
    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error("[guestbook/POST]", err);
    return Response.json({ error: "Failed to save entry" }, { status: 500 });
  }
}
