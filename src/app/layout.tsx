import type { Metadata } from "next";
import { Alfa_Slab_One, Spline_Sans } from "next/font/google";
import "./globals.css";

/* Showbill slab for the marquee, crisp grotesque for the roast copy. */
const display = Alfa_Slab_One({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Spline_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Startup Roast",
  description:
    "Pitch your startup. Four AI agents tear it apart. A judge decides if it lives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
