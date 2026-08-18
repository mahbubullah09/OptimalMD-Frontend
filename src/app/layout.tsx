import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

/**
 * Root layout holds only what is genuinely global: fonts, the base stylesheet
 * and metadataBase. The public site's chrome lives in (site)/layout.tsx and
 * the admin's in admin/layout.tsx, so neither leaks into the other.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://optimalmd.com"),
  title: {
    default: "OptimalMD",
    template: "%s | OptimalMD",
  },
};

export const viewport = {
  themeColor: "#0B2545",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      {/* Browser extensions (Grammarly and similar) inject attributes onto
          <body> before React hydrates, which otherwise logs a mismatch that
          has nothing to do with our markup. Scoped to this element only. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
