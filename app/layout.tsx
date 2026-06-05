import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { profile } from "@/lib/data";
import Providers      from "@/components/Providers";
import EasterEgg      from "@/components/EasterEgg";
import MysteryBox     from "@/components/MysteryBox";
import CommandPalette from "@/components/CommandPalette";
import ChatWidget     from "@/components/ChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";
import CursorTrail       from "@/components/CursorTrail";
import { ReadingProgress } from "@/components/ReadingProgress";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const title = `${profile.name} — ${profile.role}`;
const description = profile.blurb;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: title,
    template: `%s | ${profile.name}`,
  },
  description,
  keywords: [
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "UI Engineer",
    "AI web applications",
    "Chennai developer",
    "Bharatha Kumar",
    "portfolio",
    "Three.js",
    "TensorFlow.js",
  ],
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: profile.siteUrl,
    siteName: `${profile.name} — Portfolio`,
    title,
    description,
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: profile.siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description,
  url: profile.siteUrl,
  email: profile.email,
  telephone: profile.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  sameAs: [profile.linkedin],
  knowsAbout: [
    "React.js",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Three.js",
    "OpenAI API",
    "TensorFlow.js",
    "Docker",
    "AWS",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          themes={["dark", "light"]}
        >
          <Providers>{children}</Providers>
          <ReadingProgress />
          <CursorTrail />
          <CommandPalette />
          <EasterEgg />
          <MysteryBox />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
