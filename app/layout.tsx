import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "D&D 5e Toolkit",
  description: "Complete toolkit for D&D 5e players and DMs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="bg-ink font-crimson text-parchment-light min-h-screen">
        {children}
      </body>
    </html>
  );
}
