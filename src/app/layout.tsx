import type { Metadata } from "next";
import { Anton, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const display = Anton({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Schibsted_Grotesk({
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
