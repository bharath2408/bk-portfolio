import { ParallaxBackground } from "@/components/ParallaxBackground";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-atmosphere" aria-hidden />
      <ParallaxBackground />
      {children}
      <div className="grain" aria-hidden />
    </>
  );
}
