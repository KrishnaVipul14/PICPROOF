import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PICPROOF | From Pixels To Proof",
  description: "Cryptographic notarization of photographic evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FFFDF7] text-slate-900 min-h-screen selection:bg-rose-300 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
