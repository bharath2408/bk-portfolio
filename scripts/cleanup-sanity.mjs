/**
 * Cleanup script — deletes any Sanity documents whose _id does NOT match the
 * known set from seed-sanity.mjs.
 *
 * Sanity Studio creates documents with random UUID-format IDs.  When the seed
 * script also creates documents with deterministic IDs, you end up with both
 * sets active.  This script removes the extras.
 *
 * Usage: npm run cleanup
 */

import { createClient } from "@sanity/client";

/* ── Env ─────────────────────────────────────────────────── */
const TOKEN      = process.env.SANITY_API_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yoiw178k";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || "production";
const API_VER    = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

if (!TOKEN) {
  console.error("\n❌  SANITY_API_TOKEN is not set in .env.local\n");
  process.exit(1);
}

/* ── Known-good IDs from the seed script ────────────────── */
const KNOWN_IDS = new Set([
  "siteSettings",
  "skillGroup-0", "skillGroup-1", "skillGroup-2", "skillGroup-3",
  "skillGroup-4", "skillGroup-5", "skillGroup-6", "skillGroup-7",
  "project-customer-hub", "project-commerce-hub",
  "project-poa-revalgo",  "project-dream-hire",
  "experience-0",
  "education-0",
  "certification-0", "certification-1", "certification-2",
]);

const TYPES = [
  "siteSettings", "skillGroup", "project",
  "experience",   "education",  "certification",
];

/* ── Client (no CDN — need fresh data) ──────────────────── */
const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  apiVersion: API_VER,
  useCdn:    false,
  token:     TOKEN,
});

/* ── Run ─────────────────────────────────────────────────── */
async function cleanup() {
  console.log(`\n🧹  Checking for duplicate documents — project: ${PROJECT_ID}, dataset: ${DATASET}\n`);

  // Fetch published + draft documents of our types
  const allDocs = await client.fetch(
    `*[_type in $types]{_id, _type}`,
    { types: TYPES },
  );

  // Exclude known-good IDs and draft counterparts of known-good IDs
  const toDelete = allDocs.filter(({ _id }) => {
    const baseId = _id.replace(/^drafts\./, "");
    return !KNOWN_IDS.has(baseId);
  });

  if (toDelete.length === 0) {
    console.log("✅  No duplicates found — dataset is clean!\n");
    return;
  }

  console.log(`Found ${toDelete.length} document(s) to delete:\n`);
  toDelete.forEach(({ _id, _type }) => console.log(`  ✗  ${_id}  (${_type})`));

  const tx = client.transaction();
  toDelete.forEach(({ _id }) => tx.delete(_id));

  try {
    const result = await tx.commit({ visibility: "sync" });
    const count  = result.results.length;
    console.log(`\n✅  Deleted ${count} document${count !== 1 ? "s" : ""}.\n`);
    console.log("   Restart your dev server (npm run dev) to see clean data.\n");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Insufficient permissions")) {
      console.error("\n❌  Token has insufficient permissions — use an 'Editor' token.\n");
    } else {
      throw err;
    }
    process.exit(1);
  }
}

cleanup().catch((err) => {
  console.error("\n❌  Cleanup failed:", err.message, "\n");
  process.exit(1);
});
