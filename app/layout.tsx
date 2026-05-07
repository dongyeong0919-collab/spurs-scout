import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPURS SCOUT",
  description: "토트넘 이적 분석 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0e1a] text-white">
        <header className="bg-[#0a0e1a] border-b border-[rgba(196,163,90,0.3)]">
          <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-6">
            <Link href="/" className="text-lg font-semibold tracking-[0.3em] text-[#c4a35a]">
              SPURS SCOUT
            </Link>
            <nav className="flex items-center gap-8 text-sm text-white">
              <Link href="/" className="transition hover:text-[#c4a35a]">
                이적 타깃
              </Link>
              <Link href="/compare" className="transition hover:text-[#c4a35a]">
                후보 비교
              </Link>
              <Link href="/admin" className="transition hover:text-[#c4a35a]">
                관리자
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
