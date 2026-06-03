import { ParallaxBackground } from "@/components/ParallaxBackground";
import { RobotCompanion } from "@/components/RobotCompanion";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-atmosphere" aria-hidden />
      <ParallaxBackground />
      {children}
      <RobotCompanion />
      <div className="grain" aria-hidden />
    </>
  );
}
