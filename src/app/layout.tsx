import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nike Brain — Seu segundo cérebro",
  description:
    "Seu segundo cérebro, com Nike morando nele. Um espaço vivo onde cada pensamento vira um nó conectado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0a0a] text-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
