import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NEWS_API_URL = 'https://newsapi.org/v2/everything'
const PLAYER_PATTERNS = [
  { canonical: 'Jonathan David', patterns: ['Jonathan David'] },
  { canonical: 'Gyökeres', patterns: ['Gyökeres', 'Gyokeres'] },
  { canonical: 'Sesko', patterns: ['Sesko'] },
  { canonical: 'Højlund', patterns: ['Højlund', 'Hojlund'] },
  { canonical: 'Mbappé', patterns: ['Mbappé', 'Mbappe'] },
  { canonical: 'Osimhen', patterns: ['Osimhen'] },
  { canonical: 'Isak', patterns: ['Isak'] },
  { canonical: 'Watkins', patterns: ['Watkins'] },
  { canonical: 'Zirkzee', patterns: ['Zirkzee'] },
  { canonical: 'Fullkrug', patterns: ['Fullkrug'] },
  { canonical: 'Firmino', patterns: ['Firmino'] },
]

const STATUS_KEYWORDS = [
  { status: 'official', keywords: ['confirmed', 'signs'] },
  { status: 'talks', keywords: ['close', 'agreement'] },
  { status: 'interest', keywords: ['interest', 'target'] },
]

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findPlayerNames(text: string) {
  const matched = new Set<string>()
  for (const player of PLAYER_PATTERNS) {
    for (const pattern of player.patterns) {
      const regex = new RegExp(`\\b${escapeRegExp(pattern)}\\b`, 'i')
      if (regex.test(text)) {
        matched.add(player.canonical)
        break
      }
    }
  }
  return Array.from(matched)
}

function determineStatus(title: string) {
  const normalized = title.toLowerCase()
  for (const { status, keywords } of STATUS_KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return status
    }
  }
  return 'linked'
}

async function collectRumors() {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    throw new Error('Missing NEWS_API_KEY')
  }

  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const query = '(Tottenham transfer OR Spurs transfer OR Tottenham signing)'
  const params = new URLSearchParams({
    q: query,
    language: 'en',
    from,
    sortBy: 'publishedAt',
    pageSize: '100',
    apiKey,
  })

  const response = await fetch(`${NEWS_API_URL}?${params.toString()}`)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`NewsAPI request failed: ${response.status} ${response.statusText} - ${body}`)
  }

  const payload = await response.json()
  if (payload.status !== 'ok' || !Array.isArray(payload.articles)) {
    throw new Error('Unexpected NewsAPI response format')
  }

  const playerArticleMap = new Map<string, { title: string; status: string }>()
  const matchedPlayersSet = new Set<string>()

  for (const article of payload.articles) {
    const title = String(article.title ?? '')
    const description = String(article.description ?? '')
    const content = `${title} ${description}`.trim()
    if (!content) continue

    const matchedPlayers = findPlayerNames(content)
    if (!matchedPlayers.length) continue

    const status = determineStatus(title)
    for (const playerName of matchedPlayers) {
      matchedPlayersSet.add(playerName)
      if (!playerArticleMap.has(playerName)) {
        playerArticleMap.set(playerName, { title, status })
      }
    }
  }

  const processed = [] as string[]
  for (const [playerName, { status }] of playerArticleMap.entries()) {
    const now = new Date().toISOString()
    const { data: existing, error: selectError } = await supabase
      .from('transfer_cases')
      .select('player_name')
      .eq('player_name', playerName)
      .limit(1)
      .maybeSingle()

    if (selectError) {
      throw selectError
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('transfer_cases')
        .update({ updated_at: now })
        .eq('player_name', playerName)

      if (updateError) {
        throw updateError
      }
    } else {
      const { error: insertError } = await supabase.from('transfer_cases').insert([
        {
          player_name: playerName,
          status,
          updated_at: now,
        },
      ])

      if (insertError) {
        throw insertError
      }
    }

    processed.push(playerName)
  }

  return {
    collected: processed.length,
    debug: {
      totalArticles: payload.articles.length,
      titles: payload.articles
        .map((article: any) => String(article.title ?? ''))
        .filter(Boolean)
        .slice(0, 5),
      matchedPlayers: Array.from(matchedPlayersSet),
    },
  }
}

export async function GET() {
  try {
    const result = await collectRumors()
    return NextResponse.json({ success: true, collected: result.collected, debug: result.debug })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
