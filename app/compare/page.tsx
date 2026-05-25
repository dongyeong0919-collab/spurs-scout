import type { Metadata } from 'next'

import CompareClient from './CompareClient'

const baseUrl = 'https://spurs-scout-bfz2.vercel.app'

export const metadata: Metadata = {
  title: '토트넘 이적 후보 비교 | SPURS SCOUT',
  description:
    '토트넘 이적 타깃 선수들을 전술 적합도, 출처 신뢰도, 장점, 단점, 리스크 기준으로 비교 분석합니다.',

  keywords: [
    '토트넘 이적 후보',
    '토트넘 선수 비교',
    '토트넘 영입 후보',
    '토트넘 이적시장',
    'Spurs Scout',
    'Tottenham transfer',
  ],

  alternates: {
    canonical: '/compare',
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: '토트넘 이적 후보 비교 | SPURS SCOUT',
    description:
      '토트넘 이적 타깃 선수들을 전술 적합도, 출처 신뢰도, 장점, 단점, 리스크 기준으로 비교 분석합니다.',
    url: `${baseUrl}/compare`,
    siteName: 'SPURS SCOUT',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SPURS SCOUT 토트넘 이적 후보 비교',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: '토트넘 이적 후보 비교 | SPURS SCOUT',
    description:
      '토트넘 이적 타깃 선수들을 전술 적합도, 출처 신뢰도, 장점, 단점, 리스크 기준으로 비교 분석합니다.',
    images: ['/og-image.png'],
  },
}

export default function ComparePage() {
  return <CompareClient />
}