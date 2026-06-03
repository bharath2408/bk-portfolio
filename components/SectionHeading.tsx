import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "flex flex-col items-center text-center"
          : "flex flex-col items-start"
      }
    >
      <div className="flex items-center gap-2.5">
        <span className="h-px w-7 grad-bg" />
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-cyan">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-[2.6rem]">
        {title}
      </h2>
    </Reveal>
  );
}
