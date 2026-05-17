import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PlayerDetail = {
  name: string | null
  slug: string | null
  nationality: string | null
  position: string | null
  current_team: string | null
  age: number | null
  status: string | null
  trust_level: string | null
  source: string | null
  reliability_tier: string | null
  rumor_date: string | null
  link_reason: string | null
  fee: string | null
  fit_score: number | null
  scout_tier: string | null
  pros: string[] | string | null
  cons: string[] | string | null
  conclusion: string | null
  ready_now: string | null
  risk_summary: string | null
  role_summary: string | null
  summary?: string | null
  strengths?: string | null
  risks?: string | null
}

function formatRumorDate(value: string | null) {
  if (!value) return '-'
  return value.slice(0, 10)
}

function formatList(value: string[] | string | null | undefined) {
  if (!value) return '데이터 준비 중'

  if (Array.isArray(value)) {
    if (value.length === 0) return '데이터 준비 중'
    return value.join('\n')
  }

  return value
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const { data: player } = await supabase
    .from('transfer_targets_view')
    .select('name, position, current_team, fit_score, scout_tier')
    .eq('slug', slug)
    .single()

  const formattedName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const name = player?.name ?? formattedName
  const position = player?.position ?? '선수'
  const team = player?.current_team ?? 'Unknown Team'
  const score = player?.fit_score ?? '-'
  const tier = player?.scout_tier ?? '-'

  const title = `${name} ${position} Scout Report`
  const description = `토트넘 이적 타깃 ${name} 분석 리포트. 현재 소속팀 ${team}, Scout Tier ${tier}, 전술 적합도 ${score}점.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | SPURS SCOUT`,
      description,
      url: `https://spurs-scout-bfz2.vercel.app/player/${slug}`,
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
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: player } = await supabase
    .from('transfer_targets_view')
    .select('*')
    .eq('slug', slug)
    .single<PlayerDetail>()

  if (!player) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0e1a] text-white">
        <h1 className="text-2xl font-bold">선수를 찾을 수 없습니다.</h1>
      </main>
    )
  }

  const conclusion =
    player.conclusion ??
    player.summary ??
    '토트넘 전술 시스템에 적합한 잠재력을 가진 선수.'

  const strengths = formatList(player.pros ?? player.strengths)
  const weaknesses = formatList(player.cons)
  const risks = player.risk_summary ?? formatList(player.risks)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${player.name} Scout Report`,
    description: conclusion,
    author: {
      '@type': 'Organization',
      name: 'SPURS SCOUT',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SPURS SCOUT',
    },
    mainEntityOfPage: `https://spurs-scout-bfz2.vercel.app/player/${player.slug}`,
    about: {
      '@type': 'Person',
      name: player.name,
      nationality: player.nationality,
      roleName: player.position,
    },
    keywords: [
      'Tottenham transfer',
      'Spurs Scout',
      player.name,
      player.current_team,
      player.position,
    ].filter(Boolean),
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] px-4 py-10 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-[#c4a35a] hover:underline"
        >
          ← 이적 타깃으로 돌아가기
        </Link>

        <div className="rounded-3xl border border-[rgba(196,163,90,0.2)] bg-[#11162a] p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {player.name}
              </h1>

              <p className="mt-3 text-lg text-gray-300">
                {player.position} · {player.current_team}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>상태: {player.status ?? '-'}</Badge>
                <Badge>Scout Tier: {player.scout_tier ?? '-'}</Badge>
                <Badge>신뢰도: {player.trust_level ?? '-'}</Badge>
                <Badge>출처: {player.source ?? '-'}</Badge>
                <Badge>기자 Tier: {player.reliability_tier ?? '-'}</Badge>
                <Badge>루머 날짜: {formatRumorDate(player.rumor_date)}</Badge>
              </div>
            </div>

            <div className="rounded-2xl bg-[#c4a35a] px-6 py-4 text-center text-black">
              <p className="text-sm font-bold">전술 적합도</p>
              <p className="text-3xl font-black">{player.fit_score ?? '-'}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoCard title="기본 정보">
              <div className="space-y-2 text-gray-300">
                <p>국적: {player.nationality ?? '-'}</p>
                <p>나이: {player.age ?? '-'}</p>
                <p>Scout Tier: {player.scout_tier ?? '-'}</p>
                <p>현재 팀: {player.current_team ?? '-'}</p>
                <p>예상 이적료: {player.fee ?? '-'}</p>
              </div>
            </InfoCard>

            <InfoCard title="루머 출처">
              <div className="space-y-2 text-gray-300">
                <p>출처: {player.source ?? '-'}</p>
                <p>기자 Tier: {player.reliability_tier ?? '-'}</p>
                <p>루머 날짜: {formatRumorDate(player.rumor_date)}</p>
                <p>현재 상태: {player.status ?? '-'}</p>
                <p>신뢰도: {player.trust_level ?? '-'}</p>
              </div>
            </InfoCard>

            <InfoCard title="한줄 결론">
              <p className="leading-7 text-gray-300">{conclusion}</p>
            </InfoCard>

            <InfoCard title="링크 이유">
              <p className="leading-7 text-gray-300">
                {player.link_reason ?? '데이터 준비 중'}
              </p>
            </InfoCard>

            <InfoCard title="장점">
              <p className="whitespace-pre-line leading-7 text-gray-300">
                {strengths}
              </p>
            </InfoCard>

            <InfoCard title="단점">
              <p className="whitespace-pre-line leading-7 text-gray-300">
                {weaknesses}
              </p>
            </InfoCard>

            <InfoCard title="리스크">
              <p className="whitespace-pre-line leading-7 text-gray-300">
                {risks}
              </p>
            </InfoCard>

            <InfoCard title="즉시전력감">
              <p className="leading-7 text-gray-300">
                {player.ready_now ?? '데이터 준비 중'}
              </p>
            </InfoCard>

            <InfoCard title="전술 역할">
              <p className="leading-7 text-gray-300">
                {player.role_summary ?? '데이터 준비 중'}
              </p>
            </InfoCard>
          </div>
        </div>
      </div>
    </main>
  )
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-[#0f1324] p-6">
      <h2 className="mb-3 text-xl font-bold text-[#c4a35a]">{title}</h2>
      {children}
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#c4a35a]/25 bg-[#15203f] px-3 py-1 text-sm text-[#d1c89b]">
      {children}
    </span>
  )
}