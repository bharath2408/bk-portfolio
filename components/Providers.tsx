"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./LoadingScreen";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("intro-seen")) return;

    setLoading(true);
    document.documentElement.style.overflow = "hidden";

    const id = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("intro-seen", "1");
    }, 1900);

    return () => clearTimeout(id);
  }, []);

  const handleExitComplete = () => {
    document.documentElement.style.overflow = "";
  };

  return (
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {loading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      {children}
    </>
  );
}
