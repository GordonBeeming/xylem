import type { Metadata } from "next";
import { PT_Serif, PT_Sans, PT_Mono } from "next/font/google";
import { ThemeProviders } from "@/components/ThemeProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { getSiteConfig } from "@/lib/tina-helpers";
import "@/css/tailwind.css";

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-pt-serif",
});
const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-pt-sans",
});
const ptMono = PT_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-pt-mono",
});

const GA_MEASUREMENT_ID = "G-W0FD111Z7V";

export const metadata: Metadata = {
  metadataBase: new URL("https://gordonbeeming.com"),
  title: {
    default: "Gordon Beeming - Developer Blog",
    template: "%s | Gordon Beeming",
  },
  description:
    "Gordon Beeming - Father, Husband, Triathlete, SSW Solution Architect. Thoughts on development, DevOps, and modern web technologies.",
  openGraph: {
    title: "Gordon Beeming - Developer Blog",
    description:
      "Thoughts on development, DevOps, and modern web technologies.",
    url: "https://gordonbeeming.com",
    siteName: "xylem | Gordon Beeming",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/static/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/static/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/static/favicons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/static/favicons/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Gordon Beeming",
    card: "summary_large_image",
    creator: "@GordonBeeming",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = getSiteConfig();

  return (
    <html lang="en" suppressHydrationWarning className={`${ptSerif.variable} ${ptSans.variable} ${ptMono.variable}`}>
      <body className="bg-surface-primary text-text-primary antialiased">
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        <ThemeProviders>
          <Header siteConfig={siteConfig} />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeProviders>
      </body>
    </html>
  );
}
