"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface ThemeProviderProps {
  children:     ReactNode;
  attribute?:   string;
  defaultTheme?: string;
  enableSystem?: boolean;
  themes?:       string[];
}

// Thin wrapper so the server layout can import a client-side provider.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...(props as Record<string, unknown>)}>{children}</NextThemesProvider>;
}
