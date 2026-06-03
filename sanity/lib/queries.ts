import { groq } from "next-sanity";

// One round-trip that returns every piece of content the page needs.
export const PORTFOLIO_QUERY = groq`{
  "settings": *[_type == "siteSettings"][0]{
    name, role, location, email, phone, linkedin, tagline, blurb, about,
    stats[]{value, label}, highlights[]{title, sub}, marquee
  },
  "skills": *[_type == "skillGroup"] | order(order asc){ title, accent, items },
  "projects": *[_type == "project"] | order(order asc){
    title, kind, accent, "desc": description, tags, url, github
  },
  "experience": *[_type == "experience"] | order(order asc)[0]{
    role, company, place, period, summary, bullets
  },
  "education": *[_type == "education"][0]{ degree, school, year, cgpa },
  "certifications": *[_type == "certification"] | order(order asc){ title, sub }
}`;
