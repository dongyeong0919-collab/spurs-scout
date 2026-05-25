import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

import BackButton from '@/components/BackButton'

const baseUrl = 'https://spurs-scout-bfz2.vercel.app'

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

function formatNameFromSlug(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const { data: player } = await supabase
    .from('transfer_targets_view')
    .select('name, position, current_team, fit_score')
    .eq('slug', slug)
    .single()

  const name = player?.name ?? formatNameFromSlug(slug)
  const position = player?.position ?? '선수'
  const team = player?.current_team ?? 'Unknown Team'
  const score = player?.fit_score ?? '-'

  const title = `${name} ${position} Scout Report`
  const description = `토트넘 이적 타깃 ${name} 분석 리포트. 현재 소속팀 ${team}, 전술 적합도 ${score}점 기반 스카우팅 및 이적 루머 분석 제공.`

  return {
    title,
    description,
    keywords: [
      name,
      team,
      position,
      'Tottenham transfer',
      'Spurs Scout',
      '토트넘 이적',
      '토트넘 영입',
      '토트넘 루머',
      '토트넘 스카우팅',
    ],
    alternates: {
      canonical: `/player/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${title} | SPURS SCOUT`,
      description,
      url: `${baseUrl}/player/${slug}`,
      siteName: 'SPURS SCOUT',
      locale: 'ko_KR',
      type: 'article',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${name} Scout Report | SPURS SCOUT`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SPURS SCOUT`,
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
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7f8fa_0%,#eef1f5_50%,#f8f9fb_100%)] px-5 text-[#0b1020]">
        <div className="rounded-3xl border border-[#d8dde8] bg-white p-8 text-center shadow-[0_18px_55px_rgba(11,16,32,0.08)]">
          <h1 className="text-2xl font-black">선수를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-sm text-[#0b1020]/60">
            주소가 잘못되었거나 데이터가 삭제되었을 수 있습니다.
          </p>
        </div>
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
    mainEntityOfPage: `${baseUrl}/player/${player.slug}`,
    about: {
      '@type': 'Person',
      name: player.name,
      nationality: player.nationality,
      roleName: player.position,
    },
    keywords: [
      'Tottenham transfer',
      'Spurs Scout',
      '토트넘 이적',
      '토트넘 영입',
      player.name,
      player.current_team,
      player.position,
    ].filter(Boolean),
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7f8fa_0%,#eef1f5_50%,#f8f9fb_100%)] px-4 py-10 text-[#0b1020]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto max-w-5xl">
        <BackButton />

        <section className="mb-6 rounded-3xl border border-[#26314f] bg-[#0b1020] p-5 text-white shadow-[0_22px_70px_rgba(11,16,32,0.16)] sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black tracking-[3px] text-[#8FB8FF]">
                PLAYER SCOUT REPORT
              </p>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {player.name}
              </h1>

              <p className="mt-3 text-lg text-white/65">
                {player.position ?? '-'} · {player.current_team ?? '-'}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>상태: {player.status ?? '-'}</Badge>
                <Badge>신뢰도: {player.trust_level ?? '-'}</Badge>
                <Badge>출처: {player.source ?? '-'}</Badge>
                <Badge>기자 Tier: {player.reliability_tier ?? '-'}</Badge>
                <Badge>루머 날짜: {formatRumorDate(player.rumor_date)}</Badge>
              </div>
            </div>

            <div className="rounded-2xl bg-[#8FB8FF] px-6 py-4 text-center text-[#050816] shadow-[0_18px_45px_rgba(143,184,255,0.22)]">
              <p className="text-sm font-black">전술 적합도</p>
              <p className="text-4xl font-black">{player.fit_score ?? '-'}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="기본 정보">
            <div className="space-y-2 text-[#0b1020]/70">
              <p>국적: {player.nationality ?? '-'}</p>
              <p>나이: {player.age ?? '-'}</p>
              <p>현재 팀: {player.current_team ?? '-'}</p>
              <p>예상 이적료: {player.fee ?? '-'}</p>
            </div>
          </InfoCard>

          <InfoCard title="루머 출처">
            <div className="space-y-2 text-[#0b1020]/70">
              <p>출처: {player.source ?? '-'}</p>
              <p>기자 Tier: {player.reliability_tier ?? '-'}</p>
              <p>루머 날짜: {formatRumorDate(player.rumor_date)}</p>
              <p>현재 상태: {player.status ?? '-'}</p>
              <p>신뢰도: {player.trust_level ?? '-'}</p>
            </div>
          </InfoCard>

          <InfoCard title="한줄 결론">
            <p className="leading-7 text-[#0b1020]/70">{conclusion}</p>
          </InfoCard>

          <InfoCard title="링크 이유">
            <p className="leading-7 text-[#0b1020]/70">
              {player.link_reason ?? '데이터 준비 중'}
            </p>
          </InfoCard>

          <InfoCard title="장점">
            <p className="whitespace-pre-line leading-7 text-[#0b1020]/70">
              {strengths}
            </p>
          </InfoCard>

          <InfoCard title="단점">
            <p className="whitespace-pre-line leading-7 text-[#0b1020]/70">
              {weaknesses}
            </p>
          </InfoCard>

          <InfoCard title="리스크">
            <p className="whitespace-pre-line leading-7 text-[#0b1020]/70">
              {risks}
            </p>
          </InfoCard>

          <InfoCard title="즉시전력감">
            <p className="leading-7 text-[#0b1020]/70">
              {player.ready_now ?? '데이터 준비 중'}
            </p>
          </InfoCard>

          <InfoCard title="전술 역할">
            <p className="leading-7 text-[#0b1020]/70">
              {player.role_summary ?? '데이터 준비 중'}
            </p>
          </InfoCard>
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
    <section className="rounded-3xl border border-[#d8dde8] bg-white p-5 shadow-[0_18px_55px_rgba(11,16,32,0.08)] sm:p-6">
      <h2 className="mb-3 text-xl font-black text-[#132257]">{title}</h2>
      {children}
    </section>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#26314f] bg-[#11162a] px-3 py-1 text-sm font-medium text-white/75">
      {children}
    </span>
  )
}