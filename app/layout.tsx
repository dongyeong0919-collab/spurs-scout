import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPURS SCOUT',
  description:
    '토트넘 이적시장 분석 플랫폼. 전술 적합도, Scout Tier, 이적 루머 분석 제공.',

  verification: {
    google: 'I7tbgkk_-qajKWJQ',
  },

  openGraph: {
    title: 'SPURS SCOUT',
    description:
      '토트넘 이적시장 분석 플랫폼. 전술 적합도와 Scout Tier 기반 분석 제공.',
    url: 'https://spurs-scout-bfz2.vercel.app',
    siteName: 'SPURS SCOUT',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SPURS SCOUT',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SPURS SCOUT',
    description:
      '토트넘 이적시장 분석 플랫폼. 전술 적합도와 Scout Tier 기반 분석 제공.',
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