import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const title = "MTF Lab — Return & Risk Simulator";
const description =
  "Calculate MTF returns, break-even points, interest costs, and pledge collateral for margin trading on Groww.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title,
  description,
  applicationName: "MTF Lab",
  keywords: [
    "MTF",
    "margin trading facility",
    "Groww",
    "break-even calculator",
    "leverage",
    "pledge collateral",
    "interest cost",
  ],
  authors: [{ name: "MTF Lab" }],
  openGraph: {
    title,
    description,
    siteName: "MTF Lab",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plexMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
