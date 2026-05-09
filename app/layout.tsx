import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'SPURS SCOUT | 토트넘 이적 분석 플랫폼',
    template: '%s | SPURS SCOUT',
  },
  description:
    '토트넘 팬을 위한 비공식 이적 분석 플랫폼. 이적 루머, 전술 적합도, Scout Tier, 선수 비교 리포트를 제공합니다.',
  keywords: [
    '토트넘',
    'Tottenham',
    'Spurs',
    'SPURS SCOUT',
    '이적시장',
    '축구 이적',
    '선수 비교',
    '스카우트 리포트',
    'EPL',
  ],
  authors: [{ name: 'SPURS SCOUT' }],
  creator: 'SPURS SCOUT',
  publisher: 'SPURS SCOUT',
  metadataBase: new URL('https://spurs-scout.vercel.app'),
  openGraph: {
    title: 'SPURS SCOUT | 토트넘 이적 분석 플랫폼',
    description: 'Tottenham Transfer Intelligence Platform',
    url: 'https://spurs-scout.vercel.app',
    siteName: 'SPURS SCOUT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SPURS SCOUT',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPURS SCOUT | 토트넘 이적 분석 플랫폼',
    description: 'Tottenham Transfer Intelligence Platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0e1a] text-white">
        <header className="sticky top-0 z-50 border-b border-[rgba(196,163,90,0.3)] bg-[#0a0e1a]/90 backdrop-blur">
          <div className="mx-auto flex min-h-[64px] max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
            <Link
              href="/"
              className="text-lg font-black tracking-[0.3em] text-[#c4a35a] no-underline"
            >
              SPURS SCOUT
            </Link>

            <nav className="flex flex-wrap items-center gap-4 text-sm text-white sm:gap-8">
              <Link href="/" className="transition hover:text-[#c4a35a]">
                이적 타깃
              </Link>

              <Link href="/compare" className="transition hover:text-[#c4a35a]">
                후보 비교
              </Link>

              <Link href="/privacy" className="transition hover:text-[#c4a35a]">
                개인정보처리방침
              </Link>

              <Link href="/admin" className="transition hover:text-[#c4a35a]">
                관리자
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}