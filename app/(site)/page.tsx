import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Contact, Footer } from "@/components/Contact";
import { SectionWrapper } from "@/components/SectionWrapper";
import { getPortfolioData } from "@/sanity/lib/getData";

// Re-fetch from the CMS at most once a minute (ISR)
export const revalidate = 60;

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <main className="relative">
      <Navbar name={data.name} email={data.email} />

      {/* Hero has its own internal parallax layers — no wrapper needed */}
      <Hero
        role={data.role}
        blurb={data.blurb}
        stats={data.stats}
        email={data.email}
        openToWork={data.openToWork}
        availabilityText={data.availabilityText}
      />

      {/* Marquee is a thin strip — parallax would look jittery here */}
      <Marquee items={data.marquee} />

      <SectionWrapper>
        <About about={data.about} highlights={data.highlights} />
      </SectionWrapper>

      <SectionWrapper>
        <Skills groups={data.skills} />
      </SectionWrapper>

      <SectionWrapper>
        <Projects projects={data.projects} />
      </SectionWrapper>

      <SectionWrapper>
        <Experience
          experience={data.experience}
          education={data.education}
          certifications={data.certifications}
        />
      </SectionWrapper>

      <SectionWrapper>
        <Contact
          email={data.email}
          linkedin={data.linkedin}
          phone={data.phone}
          location={data.location}
        />
      </SectionWrapper>

      <Footer name={data.name} />
    </main>
  );
}
