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
    <main className="min-h-screen bg-[#0a0e1a] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="mb-10">
          <p className="mb-2 text-sm font-black tracking-[3px] text-[#c4a35a]">
            SPURS SCOUT BLOG
          </p>

          <h1 className="mb-4 text-4xl font-black">
            토트넘 이적시장 분석 블로그
          </h1>

          <p className="max-w-3xl leading-8 text-[#a8b0c2]">
            토트넘 이적시장 루머, 포지션 분석, 영입 후보 비교,
            전술 적합도 리포트를 제공합니다.
          </p>
        </section>

        <section className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-3xl border border-[#26314f] bg-[#11162a] p-6 no-underline transition hover:border-[#c4a35a]"
            >
              <p className="mb-3 text-sm font-bold text-[#c4a35a]">
                {post.category}
              </p>

              <h2 className="mb-3 text-2xl font-black text-white">
                {post.title}
              </h2>

              <p className="mb-4 leading-7 text-[#a8b0c2]">
                {post.excerpt}
              </p>

              <p className="text-sm text-[#777]">{post.date}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}