import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

import { posts } from './blog/posts'

const baseUrl = 'https://spurs-scout-bfz2.vercel.app'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: players } = await supabase
    .from('transfer_targets')
    .select('slug, updated_at')

  const playerUrls =
    players?.map((player) => ({
      url: `${baseUrl}/player/${player.slug}`,
      lastModified: player.updated_at
        ? new Date(player.updated_at)
        : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })) ?? []

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },

    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    ...playerUrls,
    ...blogUrls,
  ]
}