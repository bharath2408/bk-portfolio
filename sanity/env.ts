// Defaults point at the live "Bharatha Portfolio CMS" project so the app
// works out of the box. Override with .env.local if you ever move projects.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yoiw178k";
