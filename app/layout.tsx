import type { Metadata } from "next";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import VisitTracker from "./components/VisitTracker";
import { AuthProvider } from "@/contexts/AuthContext";

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
      <body>
        <AuthProvider>
          <VisitTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
