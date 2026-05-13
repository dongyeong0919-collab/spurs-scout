import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
    description: post.description,
    openGraph: {
      title: `${post.title} | SPURS SCOUT`,
      description: post.description,
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
      description: post.description,
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
    description: post.description,
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
    <main className="min-h-screen bg-[#0a0e1a] px-4 py-10 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm text-[#c4a35a] hover:underline"
        >
          ← 블로그로 돌아가기
        </Link>

        <article className="rounded-3xl border border-[#26314f] bg-[#11162a] p-8">
          <p className="mb-3 text-sm font-bold text-[#c4a35a]">
            {post.date} · {post.category}
          </p>

          <h1 className="mb-6 text-4xl font-black">
            {post.title}
          </h1>

          <div className="space-y-6 whitespace-pre-line leading-8 text-[#d1d5db]">
            {post.content}
          </div>
        </article>
      </div>
    </main>
  )
}