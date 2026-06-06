export type Accent = "iris" | "cyan" | "mint";

export interface Stat {
  value: string;
  label: string;
}
export interface Highlight {
  title: string;
  sub: string;
}
export interface SkillGroup {
  title: string;
  accent: Accent;
  items: string[];
}
export interface Project {
  title: string;
  slug:  string;   // URL-safe identifier for /work/[slug] routing
  kind: string;
  accent: Accent;
  desc: string;
  tags: string[];
  url?: string;
  github?: string;
}
export interface ExperienceItem {
  role: string;
  company: string;
  place: string;
  period: string;
  summary: string;
  bullets: string[];
}
export interface Education {
  degree: string;
  school: string;
  year: string;
  cgpa: string;
}
export interface Certification {
  title: string;
  sub: string;
}

export interface PortfolioData {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  tagline: string;
  blurb: string;
  about: string;
  openToWork: boolean;
  availabilityText: string;
  stats: Stat[];
  highlights: Highlight[];
  marquee: string[];
  skills: SkillGroup[];
  projects: Project[];
  experience: ExperienceItem;
  education: Education;
  certifications: Certification[];
}
