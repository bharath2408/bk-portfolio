# Bharatha Kumar — Developer Portfolio

Dark, modern developer portfolio built with **Next.js (App Router)**, **Tailwind CSS**,
an animated **react-three-fiber** 3D orb, **Framer Motion** animations, and a
**Sanity** headless CMS so all content is editable without touching code.

## Stack
- Next.js 14 · React 18 · TypeScript
- Tailwind CSS 3
- @react-three/fiber + drei + three (hero orb)
- framer-motion
- Sanity v3 + next-sanity (CMS, embedded Studio at `/studio`)
- Fonts: Bricolage Grotesque (display) + Geist Sans / Geist Mono

## Run locally
```bash
npm install
npm run dev
```
- Site → http://localhost:3000
- Studio (edit content) → http://localhost:3000/studio

The site reads live content from the Sanity project `yoiw178k` (dataset `production`).
If the CMS is ever unreachable, it falls back to the static copy in `lib/data.ts`,
so the page never breaks.

## Editing content
Open `/studio`, sign in with the Sanity account that owns the project, and edit:
**Site Settings** (name, tagline, about, stats…), **Projects**, **Skill Groups**,
**Experience**, **Education**, **Certifications**. Hit **Publish** and the site
updates within ~60s (ISR) — no code changes, no redeploy.

## Deploy (Vercel)
1. Push to GitHub, import the repo in Vercel (framework auto-detected).
2. No env vars are strictly required (defaults are baked in), but you can set
   `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` if you wish.
3. After the first deploy, allow your Studio origin in Sanity so `/studio` works
   in production:
   ```bash
   npx sanity cors add https://your-domain.vercel.app --credentials
   ```

## Structure
```
app/(site)/        portfolio page + layout (atmosphere/grain)
app/studio/        embedded Sanity Studio (/studio)
components/        Navbar, Hero, HeroOrb (3D), Marquee, About, Skills,
                   Projects, Experience, Contact/Footer, Reveal, SectionHeading
sanity/            env, client, GROQ queries, getData (with fallback), schemas, structure
lib/data.ts        static fallback content
lib/types.ts       shared content types
```
