import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import BackButton from '@/components/BackButton'
import { posts } from '../posts'

const baseUrl = 'https://spurs-scout-bfz2.vercel.app'

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
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    title: `${post.title} | SPURS SCOUT`,
    description: post.excerpt,

    keywords: [
      post.title,
      post.category,
      '토트넘',
      '토트넘 이적',
      '토트넘 전술',
      '토트넘 분석',
      'Tottenham',
      'Spurs',
      'Spurs Scout',
    ],

    alternates: {
      canonical: `/blog/${post.slug}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `${post.title} | SPURS SCOUT`,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      siteName: 'SPURS SCOUT',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${post.title} | SPURS SCOUT`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | SPURS SCOUT`,
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
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'SPURS SCOUT',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SPURS SCOUT',
    },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
    image: `${baseUrl}/og-image.png`,
    keywords: [
      post.category,
      '토트넘',
      '토트넘 이적',
      '토트넘 전술',
      'Spurs Scout',
    ],
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7f8fa_0%,#eef1f5_50%,#f8f9fb_100%)] px-4 py-10 text-[#0b1020]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto max-w-4xl">
        <BackButton />

        <article className="overflow-hidden rounded-[32px] border border-[#26314f] bg-[#0b1020] text-white shadow-[0_22px_70px_rgba(11,16,32,0.16)]">
          <header className="border-b border-[#26314f] bg-[#0b1020] p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#8FB8FF] px-3 py-1 text-xs font-black text-[#050816]">
                {post.category}
              </span>

              <span className="text-sm font-bold text-white/45">
                {post.date}
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              {post.title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
              {post.excerpt}
            </p>
          </header>

          <div className="bg-[#11162a] p-6 sm:p-8">
            <div className="whitespace-pre-line text-[17px] leading-9 text-white/80">
              {post.content}
            </div>

            <div className="mt-10 border-t border-[#26314f] pt-6">
              <Link
                href="/blog"
                className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white no-underline transition hover:border-[#8FB8FF] hover:text-[#8FB8FF]"
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