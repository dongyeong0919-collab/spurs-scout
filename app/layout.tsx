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
    '토트넘 팬을 위한 비공식 이적 분석 플랫폼. 이적 루머, 전술 적합도, Scout Tier, 장단점, 리스크 기반 선수 분석을 제공합니다.',
  keywords: [
    '토트넘',
    'Tottenham',
    'Spurs',
    'SPURS SCOUT',
    '이적시장',
    '축구 이적',
    '선수 분석',
    '선수 비교',
    '스카우트 리포트',
    '프리미어리그',
    'EPL',
  ],
  authors: [{ name: 'SPURS SCOUT' }],
  creator: 'SPURS SCOUT',
  publisher: 'SPURS SCOUT',
  metadataBase: new URL('https://spurs-scout-bfz2.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SPURS SCOUT | 토트넘 이적 분석 플랫폼',
    description:
      '토트넘 팬들을 위한 비공식 이적 분석 플랫폼. 전술 적합도, Scout Tier, 장단점, 리스크 기반 분석 제공.',
    url: 'https://spurs-scout-bfz2.vercel.app',
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
    description:
      '토트넘 팬들을 위한 비공식 이적 분석 플랫폼. 전술 적합도 기반으로 영입 후보를 분석합니다.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

function NavLink({
  href,
  children,
  prefetch,
}: {
  href: string
  children: React.ReactNode
  prefetch?: boolean
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className="rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-[rgba(196,163,90,0.12)] hover:text-[#c4a35a]"
    >
      {children}
    </Link>
  )
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
              className="text-center text-lg font-black tracking-[0.3em] text-[#c4a35a] no-underline sm:text-left"
            >
              SPURS SCOUT
            </Link>

            <nav className="flex w-full flex-wrap items-center justify-center gap-2 text-white sm:w-auto sm:justify-end sm:gap-3">
              <NavLink href="/">이적 타깃</NavLink>
              <NavLink href="/compare">후보 비교</NavLink>
              <NavLink href="/privacy">개인정보처리방침</NavLink>
              <NavLink href="/admin" prefetch={false}>
                관리자
              </NavLink>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}