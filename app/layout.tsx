import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Commodities Inflation Tracker",
  description: "Track commodity prices over time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
