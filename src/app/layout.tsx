// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joey Hendrickson - Consultant & Musician",
  description: "Consultant specializing in complex project management for Fortune 100 companies, startups, and cities. Also a musician and songwriter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <ConditionalNavbar />
        <main>{children}</main>
      </body>
    </html>
  )
}