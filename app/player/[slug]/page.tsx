import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    .single()

  if (!player) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0e1a] text-white">
        <h1 className="text-2xl font-bold">선수를 찾을 수 없습니다.</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-[#c4a35a] hover:underline"
        >
          ← 이적 타깃으로 돌아가기
        </Link>

        <div className="rounded-3xl border border-[rgba(196,163,90,0.2)] bg-[#11162a] p-8 shadow-2xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                {player.name}
              </h1>

              <p className="mt-2 text-lg text-gray-300">
                {player.position} · {player.current_team}
              </p>
            </div>

            <div className="rounded-2xl bg-[#c4a35a] px-6 py-4 text-center text-black">
              <p className="text-sm font-bold">전술 적합도</p>

              <p className="text-3xl font-black">
                {player.fit_score ?? '-'}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-[#0f1324] p-6">
              <h2 className="mb-3 text-xl font-bold text-[#c4a35a]">
                기본 정보
              </h2>

              <div className="space-y-2 text-gray-300">
                <p>국적: {player.nationality}</p>
                <p>나이: {player.age}</p>
                <p>Scout Tier: {player.scout_tier}</p>
                <p>현재 팀: {player.current_team}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0f1324] p-6">
              <h2 className="mb-3 text-xl font-bold text-[#c4a35a]">
                한줄 결론
              </h2>

              <p className="leading-7 text-gray-300">
                {player.summary ??
                  '토트넘 전술 시스템에 적합한 잠재력을 가진 선수.'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#0f1324] p-6">
              <h2 className="mb-3 text-xl font-bold text-[#c4a35a]">
                장점
              </h2>

              <p className="whitespace-pre-line leading-7 text-gray-300">
                {player.strengths ?? '데이터 준비 중'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#0f1324] p-6">
              <h2 className="mb-3 text-xl font-bold text-[#c4a35a]">
                리스크
              </h2>

              <p className="whitespace-pre-line leading-7 text-gray-300">
                {player.risks ?? '데이터 준비 중'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}