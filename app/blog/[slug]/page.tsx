import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import BackButton from '@/components/BackButton'
import { posts } from '../posts'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const post = posts.find((item) => item.slug === slug)

  if (!post) {
    return {
      title: 'Post Not Found | SPURS SCOUT',
    }
  }

  return {
    title: `${post.title} | SPURS SCOUT`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | SPURS SCOUT`,
      description: post.excerpt,
      url: `https://spurs-scout-bfz2.vercel.app/blog/${post.slug}`,
      siteName: 'SPURS SCOUT',
      locale: 'ko_KR',
      type: 'article',
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
      title: post.title,
      description: post.excerpt,
      images: ['/og-image.png'],
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = posts.find((item) => item.slug === slug)

  if (!post) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'SPURS SCOUT',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SPURS SCOUT',
    },
    mainEntityOfPage: `https://spurs-scout-bfz2.vercel.app/blog/${post.slug}`,
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto max-w-4xl">
        <BackButton />

        <article className="overflow-hidden rounded-[32px] border border-[#26314f] bg-[#11162a] shadow-[0_0_40px_rgba(255,255,255,0.05)]">
          <header className="border-b border-[#26314f] bg-[#0b1020] p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#050816]">
                {post.category}
              </span>

              <span className="text-sm font-bold text-white/50">
                {post.date}
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight text-white sm:text-5xl">
              {post.title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">
              {post.excerpt}
            </p>
          </header>

          <div className="p-6 sm:p-8">
            <div className="whitespace-pre-line text-[17px] leading-9 text-white/82">
              {post.content}
            </div>

            <div className="mt-10 border-t border-[#26314f] pt-6">
              <Link
                href="/blog"
                className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white hover:text-[#050816]"
              >
                블로그 목록으로 →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}