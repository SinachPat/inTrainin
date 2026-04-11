import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2ede6" },
    { media: "(prefers-color-scheme: dark)",  color: "#1a1612" },
  ],
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
  title: "InTrainin | Get Trained, Certified & Hired in Nigeria",
  applicationName: "InTrainin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InTrainin",
  },
  formatDetection: {
    telephone: false,
  },
  description:
    "InTrainin helps Nigeria's informal sector workers get trained in role-specific skills, earn verifiable certificates, and get matched to real jobs — for free.",
  openGraph: {
    title: "InTrainin | Get Trained, Certified & Hired in Nigeria",
    description:
      "Nigeria's role-based learning platform for informal sector workers. Get trained, earn a verifiable certificate, and get matched to real jobs — start free today.",
    url: "/",
    siteName: "InTrainin",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "InTrainin — Get trained. Get certified. Get hired." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InTrainin | Get Trained, Certified & Hired in Nigeria",
    description:
      "Nigeria's role-based learning platform for informal sector workers. Get trained, earn a verifiable certificate, and get matched to real jobs — start free today.",
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
        {/* PWA — Apple devices don't read the manifest for home-screen icon */}
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
