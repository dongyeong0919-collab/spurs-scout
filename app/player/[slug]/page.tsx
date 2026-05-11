import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getStatusColor(status: string | null) {
  if (status === 'talks') return '#f59e0b'
  if (status === 'interest') return '#2563eb'
  if (status === 'linked') return '#64748b'
  if (status === 'verbal') return '#7c3aed'
  if (status === 'official') return '#16a34a'
  return '#475569'
}

function getScoreColor(score: number) {
  if (score >= 85) return '#4ade80'
  if (score >= 70) return '#facc15'
  return '#f87171'
}

function getTierColor(tier: string | null) {
  if (tier === 'S') return '#facc15'
  if (tier === 'A') return '#4ade80'
  if (tier === 'B') return '#60a5fa'
  if (tier === 'C') return '#f97316'
  return '#64748b'
}

function getTierText(tier: string | null) {
  if (tier === 'S') return '최우선 영입급'
  if (tier === 'A') return '강력 추천'
  if (tier === 'B') return '검토 가치 있음'
  if (tier === 'C') return '리스크 큼'
  return '평가 대기'
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('transfer_targets_view')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0b1020] p-6 text-white">
        선수 없음
      </main>
    )
  }

  const score = data.fit_score ?? 0
  const scoreColor = getScoreColor(score)
  const tierColor = getTierColor(data.scout_tier)
  const tierText = getTierText(data.scout_tier)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#17213a_0%,#0b1020_45%,#050816_100%)] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1120px]">
        <Link
          href="/"
          className="mb-6 inline-block font-extrabold text-[#c6a96b] no-underline"
        >
          ← 메인으로 돌아가기
        </Link>

        <section className="mb-6 rounded-[28px] border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:rounded-[30px] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#c6a96b_0%,#6b5a2e_100%)] text-[22px] font-black text-[#0b1020] sm:h-[88px] sm:w-[88px] sm:rounded-[26px] sm:text-[28px]">
                {getInitials(data.name)}
              </div>

              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3.5 py-2 text-xs font-black uppercase"
                    style={{ background: getStatusColor(data.status) }}
                  >
                    {data.status ?? 'unknown'}
                  </span>

                  <span
                    className="rounded-full px-3.5 py-2 text-xs font-black text-[#0b1020]"
                    style={{ background: tierColor }}
                  >
                    {data.scout_tier ?? '-'} TIER · {tierText}
                  </span>
                </div>

                <h1 className="m-0 text-[clamp(32px,7vw,48px)] font-black leading-tight tracking-[-1px]">
                  {data.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{data.position ?? '-'}</Badge>
                  <Badge>{data.nationality ?? '-'}</Badge>
                  <Badge>현재 소속팀: {data.current_team ?? '-'}</Badge>
                  <Badge>나이: {data.age ?? '-'}</Badge>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[220px] rounded-[22px] border border-[#33415f] bg-[#0b1020] p-5 text-center lg:text-right">
              <p className="mb-2 text-[#888]">전술 적합도</p>
              <strong className="text-[40px] sm:text-[44px]" style={{ color: scoreColor }}>
                {score}
              </strong>
              <span className="font-bold text-[#aaa]">/100</span>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[28px] border border-[rgba(198,169,107,0.3)] bg-[linear-gradient(135deg,rgba(198,169,107,0.16),rgba(17,22,42,0.94))] p-5 sm:p-8">
          <h2 className="mb-5 mt-0 text-[clamp(24px,5vw,30px)]">
            Scout Report
          </h2>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] sm:gap-5">
            <ScoutCard title="한줄 결론" value={data.conclusion ?? '분석 준비중'} />
            <ScoutCard title="즉시전력감" value={data.ready_now ?? '분석 준비중'} />
            <ScoutCard title="리스크" value={data.risk_summary ?? '분석 준비중'} />
            <ScoutCard title="전술 역할" value={data.role_summary ?? '분석 준비중'} />
            <ScoutCard title="케미 좋은 선수" value={data.chemistry ?? '분석 준비중'} />
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="m-0 text-[clamp(22px,5vw,24px)]">적합도 게이지</h2>
            <strong style={{ color: scoreColor }}>{score}/100</strong>
          </div>

          <div className="h-[13px] overflow-hidden rounded-full border border-[#1f2942] bg-[#0b1020]">
            <div
              style={{
                width: `${score}%`,
                height: '100%',
                borderRadius: 999,
                background: scoreColor,
              }}
            />
          </div>
        </section>

        <section className="mb-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))] sm:gap-5">
          <InfoCard title="Scout Tier" value={`${data.scout_tier ?? '-'} · ${tierText}`} />
          <InfoCard title="현재 소속팀" value={data.current_team ?? '-'} />
          <InfoCard title="나이" value={data.age ?? '-'} />
          <InfoCard title="신뢰도" value={data.trust_level ?? '-'} />
          <InfoCard title="예상 이적료" value={data.fee ?? '-'} />
          <InfoCard title="출처" value={data.source ?? '-'} />
        </section>

        <Section title="분석">
          {data.link_reason ?? '분석 정보가 아직 없습니다.'}
        </Section>

        <div className="mb-6 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          <ListCard
            title="장점"
            items={data.pros ?? []}
            emptyText="장점 정보가 없습니다."
            accent="#4ade80"
          />

          <ListCard
            title="단점"
            items={data.cons ?? []}
            emptyText="단점 정보가 없습니다."
            accent="#f87171"
          />
        </div>

        <p className="mt-9 text-[13px] text-[#777]">
          본 사이트는 팬 제작 비공식 분석 플랫폼입니다. Tottenham Hotspur와
          공식 제휴된 서비스가 아닙니다.
        </p>
      </div>
    </main>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#33415f] bg-[#0b1020] px-3 py-1.5 text-[13px] text-[#d1d5db]">
      {children}
    </span>
  )
}

function InfoCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[20px] border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-6">
      <p className="mb-2.5 text-sm text-[#888]">{title}</p>
      <h2 className="m-0 break-words text-[clamp(20px,5vw,24px)]">{value}</h2>
    </div>
  )
}

function ScoutCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[rgba(198,169,107,0.18)] bg-[rgba(11,16,32,0.72)] p-5 sm:p-6">
      <p className="mb-3 font-black text-[#c6a96b]">{title}</p>
      <p className="m-0 leading-7 text-[#f3f4f6]">{value}</p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-6 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
      <h2 className="mb-4 text-[clamp(22px,5vw,26px)]">{title}</h2>
      <p className="text-[15px] leading-8 text-[#ddd] sm:text-[17px]">{children}</p>
    </section>
  )
}

function ListCard({
  title,
  items,
  emptyText,
  accent,
}: {
  title: string
  items: string[]
  emptyText: string
  accent: string
}) {
  return (
    <section className="rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
      <h2 className="mb-5 text-[clamp(22px,5vw,26px)]">{title}</h2>

      {items.length > 0 ? (
        <ul className="m-0 list-none p-0 leading-8 text-[#ddd]">
          {items.map((item, index) => (
            <li key={index} className="mb-2.5 flex items-center gap-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: accent }}
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#888]">{emptyText}</p>
      )}
    </section>
  )
}