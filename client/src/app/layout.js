import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaInstall from "./components/PwaInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PG Connect | Verified PGs and Co-living Spaces",
    template: "%s | PG Connect",
  },
  description: "Find verified PGs and co-living spaces with transparent pricing, room availability, amenities, and manager details.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "PG Connect",
    title: "PG Connect | Verified PGs and Co-living Spaces",
    description: "Compare verified PG listings, amenities, pricing, and availability in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PG Connect | Verified PGs and Co-living Spaces",
    description: "Compare verified PG listings, amenities, pricing, and availability in one place.",
  },
  category: "real-estate",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PG Connect",
  },
  icons: {
    icon: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1D4ED8",
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('pg-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so the theme is correct on first render — no flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-[var(--pg-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        {children}
        <PwaInstall />
      </body>
    </html>
  );
}
