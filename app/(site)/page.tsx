import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Contact, Footer } from "@/components/Contact";
import { getPortfolioData } from "@/sanity/lib/getData";

// Re-fetch from the CMS at most once a minute (ISR)
export const revalidate = 60;

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <main className="relative">
      <Navbar name={data.name} email={data.email} />
      <Hero
        role={data.role}
        blurb={data.blurb}
        stats={data.stats}
        email={data.email}
      />
      <Marquee items={data.marquee} />
      <About about={data.about} highlights={data.highlights} />
      <Skills groups={data.skills} />
      <Projects projects={data.projects} />
      <Experience
        experience={data.experience}
        education={data.education}
        certifications={data.certifications}
      />
      <Contact
        email={data.email}
        linkedin={data.linkedin}
        phone={data.phone}
        location={data.location}
      />
      <Footer name={data.name} />
    </main>
  );
}
