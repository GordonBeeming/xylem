import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProviders } from "@/components/ThemeProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "@/css/tailwind.css";

const GA_MEASUREMENT_ID = "G-W0FD111Z7V";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-surface-primary text-text-primary antialiased">
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        <ThemeProviders>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeProviders>
      </body>
    </html>
  );
}
