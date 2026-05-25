import type { Metadata } from 'next'
import Link from 'next/link'

import BackButton from '@/components/BackButton'
import { posts } from '../blog/posts'

export const metadata: Metadata = {
  title: '토트넘 뉴스 | SPURS SCOUT',
  description:
    '토트넘 이적시장 뉴스, 루머, 영입 후보 분석 콘텐츠를 모아보는 SPURS SCOUT 뉴스 페이지입니다.',
}

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7f8fa_0%,#eef1f5_50%,#f8f9fb_100%)] px-4 py-10 text-[#0b1020]">
      <div className="mx-auto max-w-5xl">
        <BackButton />

        <section className="mb-8 rounded-[30px] bg-[#0b1020] p-6 text-white shadow-[0_22px_70px_rgba(11,16,32,0.16)] sm:p-8">
          <p className="mb-3 text-xs font-black tracking-[3px] text-[#8FB8FF]">
            SPURS SCOUT NEWS
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            토트넘 뉴스
          </h1>

          <p className="mt-4 max-w-3xl leading-8 text-white/65">
            토트넘 이적시장 루머, 영입 후보, 포지션 보강, 전술 분석 콘텐츠를
            모아볼 수 있습니다.
          </p>
        </section>

        <section className="grid gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-[28px] bg-[#0b1020] p-5 text-white no-underline shadow-[0_18px_55px_rgba(11,16,32,0.14)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#132257] sm:p-6"
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

              <p className="mb-5 leading-7 text-white/65">{post.excerpt}</p>

              <span className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white transition group-hover:border-[#8FB8FF] group-hover:text-[#8FB8FF]">
                읽기 →
              </span>
            </Link>
          ))}
        </section>

        <div className="mt-10 flex justify-center">
          <Link
            href="/blog"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#132257] no-underline shadow-[0_10px_30px_rgba(11,16,32,0.08)] transition hover:text-[#8FB8FF]"
          >
            블로그 전체 보기 →
          </Link>
        </div>
      </div>
    </main>
  )
}