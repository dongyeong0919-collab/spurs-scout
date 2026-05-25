import type { Metadata } from 'next'
import Link from 'next/link'

import BackButton from '@/components/BackButton'
import { posts } from './posts'

const baseUrl = 'https://spurs-scout-bfz2.vercel.app'

export const metadata: Metadata = {
  title: '토트넘 이적 블로그 | SPURS SCOUT',
  description:
    '토트넘 이적시장 루머, 영입 후보, 포지션 보강, 전술 적합도 분석 콘텐츠를 제공하는 SPURS SCOUT 블로그입니다.',

  keywords: [
    '토트넘',
    '토트넘 이적',
    '토트넘 이적시장',
    '토트넘 영입',
    '토트넘 전술',
    'Tottenham',
    'Spurs',
    'Spurs Scout',
  ],

  alternates: {
    canonical: '/blog',
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: '토트넘 이적 블로그 | SPURS SCOUT',
    description:
      '토트넘 이적시장 루머, 영입 후보, 포지션 보강, 전술 적합도 분석 콘텐츠를 제공합니다.',
    url: `${baseUrl}/blog`,
    siteName: 'SPURS SCOUT',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SPURS SCOUT 토트넘 이적 블로그',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: '토트넘 이적 블로그 | SPURS SCOUT',
    description:
      '토트넘 이적시장 루머, 영입 후보, 포지션 보강, 전술 적합도 분석 콘텐츠를 제공합니다.',
    images: ['/og-image.png'],
  },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7f8fa_0%,#eef1f5_50%,#f8f9fb_100%)] px-4 py-10 text-[#0b1020]">
      <div className="mx-auto max-w-5xl">
        <BackButton />

        <section className="mb-8 overflow-hidden rounded-[30px] border border-[#26314f] bg-[#0b1020] p-6 text-white shadow-[0_22px_70px_rgba(11,16,32,0.16)] sm:p-8">
          <p className="mb-3 text-xs font-black tracking-[3px] text-[#8FB8FF]">
            SPURS SCOUT BLOG
          </p>

          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            토트넘 이적시장 분석 블로그
          </h1>

          <p className="max-w-3xl leading-8 text-white/65">
            토트넘 이적시장 루머, 포지션 분석, 영입 후보 비교,
            전술 적합도 리포트를 제공합니다.
          </p>
        </section>

        <section className="grid gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-[28px] border border-[#26314f] bg-[#0b1020] p-5 text-white no-underline shadow-[0_18px_55px_rgba(11,16,32,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#8FB8FF] hover:bg-[#132257] sm:p-6"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#8FB8FF] px-3 py-1 text-xs font-black text-[#050816]">
                  {post.category}
                </span>

                <span className="text-sm font-bold text-white/45">
                  {post.date}
                </span>
              </div>

              <h2 className="mb-3 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                {post.title}
              </h2>

              <p className="mb-5 leading-7 text-white/65">
                {post.excerpt}
              </p>

              <span className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white transition group-hover:border-[#8FB8FF] group-hover:text-[#8FB8FF]">
                읽기 →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}