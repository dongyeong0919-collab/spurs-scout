import type { Metadata } from 'next'
import './globals.css'

const baseUrl = 'https://spurs-scout-bfz2.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default: 'SPURS SCOUT | 토트넘 이적시장 분석',
    template: '%s | SPURS SCOUT',
  },

  description:
    '토트넘 이적시장과 영입 후보를 전술 적합도, 출처 신뢰도, 이적 가능성 중심으로 분석하는 비공식 Spurs 스카우팅 플랫폼입니다.',

  keywords: [
    '토트넘',
    '토트넘 이적',
    '토트넘 이적시장',
    '토트넘 영입',
    '토트넘 루머',
    'Tottenham',
    'Spurs',
    'Spurs Scout',
    'Tottenham transfer',
  ],

  authors: [{ name: 'SPURS SCOUT' }],
  creator: 'SPURS SCOUT',
  publisher: 'SPURS SCOUT',

  verification: {
    google: 'l7tbgkk_-qajKWJQCgTymDxVwtrmpleDfCVjyCwmPow',
  },

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  openGraph: {
    title: 'SPURS SCOUT | 토트넘 이적시장 분석',
    description:
      '토트넘 이적시장과 영입 후보를 전술 적합도, 출처 신뢰도, 이적 가능성 중심으로 분석합니다.',
    url: baseUrl,
    siteName: 'SPURS SCOUT',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SPURS SCOUT 토트넘 이적시장 분석',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SPURS SCOUT | 토트넘 이적시장 분석',
    description:
      '토트넘 이적시장과 영입 후보를 전술 적합도, 출처 신뢰도, 이적 가능성 중심으로 분석합니다.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}