import { client } from "./client";
import { PORTFOLIO_QUERY } from "./queries";
import { projectId } from "../env";
import {
  profile as fbProfile,
  skillGroups as fbSkills,
  projects as fbProjects,
  experience as fbExperience,
  education as fbEducation,
  certifications as fbCerts,
  marqueeStack as fbMarquee,
} from "@/lib/data";
import type { PortfolioData } from "@/lib/types";

const has = (a: unknown) => Array.isArray(a) && a.length > 0;

// Slug lookup keyed by project title so Sanity projects (which have no
// slug field in the CMS schema) still get the correct routing slug.
const slugByTitle = Object.fromEntries(fbProjects.map((p) => [p.title, p.slug]));

export async function getPortfolioData(): Promise<PortfolioData> {
  let d: any = null;

  if (projectId) {
    try {
      d = await client.fetch(
        PORTFOLIO_QUERY,
        {},
        { next: { revalidate: 60 } },
      );
    } catch {
      // network/CMS unavailable at build or runtime -> use static fallback
      d = null;
    }
  }

  const s = d?.settings ?? {};

  return {
    name: s.name ?? fbProfile.name,
    role: s.role ?? fbProfile.role,
    location: s.location ?? fbProfile.location,
    email: s.email ?? fbProfile.email,
    phone: s.phone ?? fbProfile.phone,
    linkedin: s.linkedin ?? fbProfile.linkedin,
    tagline: s.tagline ?? fbProfile.tagline,
    blurb: s.blurb ?? fbProfile.blurb,
    about: s.about ?? fbProfile.about,
    stats: has(s.stats) ? s.stats : fbProfile.stats,
    highlights: has(s.highlights) ? s.highlights : fbProfile.highlights,
    marquee: has(s.marquee) ? s.marquee : fbMarquee,
    skills: has(d?.skills) ? d.skills : fbSkills,
    projects: has(d?.projects)
      // Merge Sanity projects with their static slugs (slug is not a CMS field)
      ? d.projects.map((p: Record<string, unknown>) => ({
          ...p,
          slug: (typeof p.slug === "string" && p.slug) ||
                slugByTitle[p.title as string] ||
                "",
        }))
      : fbProjects,
    experience: d?.experience ?? fbExperience,
    education: d?.education ?? fbEducation,
    certifications: has(d?.certifications) ? d.certifications : fbCerts,
  };
}
