import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from './posts'

export const metadata: Metadata = {
  title: '토트넘 이적 블로그 | SPURS SCOUT',
  description:
    '토트넘 이적시장 분석, 영입 후보, 포지션 보강, 전술 적합도 분석 콘텐츠를 제공합니다.',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="mb-10 rounded-[30px] border border-[#26314f] bg-[#11162a] p-6 sm:p-8">
          <p className="mb-3 text-xs font-black tracking-[3px] text-white/70">
            SPURS SCOUT BLOG
          </p>

          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-5xl">
            토트넘 이적시장 분석 블로그
          </h1>

          <p className="max-w-3xl leading-8 text-white/70">
            토트넘 이적시장 루머, 포지션 분석, 영입 후보 비교,
            전술 적합도 리포트를 제공합니다.
          </p>
        </section>

        <section className="grid gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-[28px] border border-[#26314f] bg-[#0b1020] p-6 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.10)]"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#050816]">
                  {post.category}
                </span>

                <span className="text-sm font-bold text-white/50">
                  {post.date}
                </span>
              </div>

              <h2 className="mb-3 text-2xl font-black leading-tight text-white sm:text-3xl">
                {post.title}
              </h2>

              <p className="mb-5 leading-7 text-white/70">
                {post.excerpt}
              </p>

              <span className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white transition group-hover:bg-white group-hover:text-[#050816]">
                읽기 →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}