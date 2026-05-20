import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
