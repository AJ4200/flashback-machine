import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const arcadeText = VT323({
  variable: "--font-arcade-text",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "RetroNet Arcade",
  description: "A neon browser arcade for classic Flash games powered by Ruffle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${arcadeText.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
