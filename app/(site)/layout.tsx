import { ParallaxBackground } from "@/components/ParallaxBackground";
import { PixelPet } from "@/components/PixelPet";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-atmosphere" aria-hidden />
      <ParallaxBackground />
      {children}
      <div className="grain" aria-hidden />
      <PixelPet />
    </>
  );
}
