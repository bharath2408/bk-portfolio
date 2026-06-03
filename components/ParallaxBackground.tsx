"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/** Three large blurred gradient orbs that drift at different rates for page depth. */
export function ParallaxBackground() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: y1 }}
        className="absolute -left-40 top-[8%] h-[42rem] w-[42rem] rounded-full bg-iris/10 blur-[130px]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -right-40 top-[42%] h-[36rem] w-[36rem] rounded-full bg-cyan/10 blur-[130px]"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute left-[18%] top-[78%] h-[32rem] w-[32rem] rounded-full bg-mint/[0.07] blur-[130px]"
      />
    </div>
  );
}
