import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ThemeProviders } from "@/components/ThemeProviders";
import { FeatureFlagScript } from "@/components/FeatureFlagScript";
import { FeatureFlagProvider } from "@/components/FeatureFlagProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { getSiteConfig } from "@/lib/tina-helpers";
import "@/css/tailwind.css";

const GA_MEASUREMENT_ID = "G-W0FD111Z7V";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

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
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-surface-primary text-text-primary antialiased">
        <FeatureFlagScript />
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        <ThemeProviders>
          <FeatureFlagProvider>
            <ChromeGate>
              <Header siteConfig={siteConfig} />
            </ChromeGate>
            <main id="main-content">{children}</main>
            <ChromeGate>
              <Footer />
            </ChromeGate>
          </FeatureFlagProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
