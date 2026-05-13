import type { Metadata } from 'next'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: '토트넘 이적 후보 비교 | SPURS SCOUT',
  description:
    '토트넘 이적 타깃 선수들을 전술 적합도, Scout Tier, 리스크, 장점과 단점 기준으로 비교 분석합니다.',
  openGraph: {
    title: '토트넘 이적 후보 비교 | SPURS SCOUT',
    description:
      '토트넘 이적 타깃 선수들을 전술 적합도와 Scout Tier 기준으로 비교 분석합니다.',
    url: 'https://spurs-scout-bfz2.vercel.app/compare',
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
    title: '토트넘 이적 후보 비교 | SPURS SCOUT',
    description:
      '토트넘 이적 타깃 선수들을 전술 적합도와 Scout Tier 기준으로 비교 분석합니다.',
    images: ['/og-image.png'],
  },
}

export default function ComparePage() {
  return <CompareClient />
}