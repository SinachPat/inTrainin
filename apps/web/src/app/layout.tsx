import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://intrainin.vercel.app",
  ),
  title: "InTrainin | Role-Based Learning Platform",
  description:
    "InTrainin is a web-first progressive learning platform helping informal sector workers get trained, certified, and matched to better jobs.",
  openGraph: {
    title: "InTrainin | Role-Based Learning Platform",
    description:
      "Get trained, certified, and hired. Role-based learning for informal sector workers across Nigeria.",
    url: "/",
    siteName: "InTrainin",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "InTrainin — Get trained. Get certified. Get hired." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InTrainin | Role-Based Learning Platform",
    description:
      "Get trained, certified, and hired. Role-based learning for informal sector workers across Nigeria.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${interTight.variable} antialiased`}
    >
      <head>
        {/* Runs synchronously before first paint — prevents dark/light flash */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
