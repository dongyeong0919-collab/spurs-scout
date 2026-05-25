'use client'

import Link from 'next/link'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Target = {
  case_id: number
  player_id: number
  name: string
  slug: string
  nationality: string | null
  position: string | null
  age: number | null
  current_team: string | null
  status: string | null
  trust_level: string | null
  source: string | null
  reliability_tier: string | null
  rumor_date: string | null
  fee: string | null
  fit_score: number | null
  conclusion: string | null
  ready_now: string | null
  risk_summary: string | null
  role_summary: string | null
  chemistry: string | null
  pros: string[] | null
  cons: string[] | null
}

const traits = ['창의성', '압박', '침투', '연계', '결정력', '속도']

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getScoreColor(score: number) {
  if (score >= 85) return '#4ade80'
  if (score >= 70) return '#8FB8FF'
  return '#fb7185'
}

function formatRumorDate(value: string | null) {
  if (!value) return '-'
  return value.slice(0, 10)
}

function getTraitScore(player: Target | null, trait: string) {
  if (!player) return 0

  const fit = player.fit_score ?? 0
  const text = [player.conclusion, player.role_summary, ...(player.pros ?? [])]
    .join(' ')
    .toLowerCase()

  let bonus = 0

  if (trait === '창의성' && /창의|패스|전진|하프스페이스|전개/.test(text)) bonus += 8
  if (trait === '압박' && /압박|수비|전환/.test(text)) bonus += 8
  if (trait === '침투' && /침투|박스|움직임|2선/.test(text)) bonus += 8
  if (trait === '연계' && /연계|패스|전개|케미/.test(text)) bonus += 8
  if (trait === '결정력' && /결정력|마무리|골|슈팅/.test(text)) bonus += 8
  if (trait === '속도' && /속도|스피드|돌파|드리블/.test(text)) bonus += 8

  return Math.min(100, Math.max(55, fit - 8 + bonus))
}

function getWinner(left: Target | null, right: Target | null) {
  if (!left || !right) return null

  const leftScore = left.fit_score ?? 0
  const rightScore = right.fit_score ?? 0

  if (leftScore > rightScore) return left
  if (rightScore > leftScore) return right
  return null
}

function getWinnerText(left: Target | null, right: Target | null) {
  if (!left || !right) return '선수 2명을 선택하면 비교 결과가 표시됩니다.'

  const winner = getWinner(left, right)

  if (!winner) {
    return '두 선수의 종합 평가는 비슷합니다. 이적료, 리스크, 전술 역할까지 함께 비교하는 것이 좋습니다.'
  }

  return `${winner.name} 쪽이 현재 데이터 기준으로 토트넘에 더 적합한 후보입니다.`
}

function getRecommendationReasons(left: Target, right: Target, winner: Target | null) {
  if (!winner) {
    return [
      '전술 적합도 차이가 크지 않음',
      '이적료, 리스크, 포지션 역할에 따라 선택이 달라질 수 있음',
    ]
  }

  const loser = winner.case_id === left.case_id ? right : left
  const reasons: string[] = []

  if ((winner.fit_score ?? 0) > (loser.fit_score ?? 0)) {
    reasons.push('전술 적합도 점수가 더 높음')
  }

  if (winner.ready_now) {
    reasons.push('즉시전력감 판단에 참고할 수 있는 정보가 있음')
  }

  if (winner.risk_summary) {
    reasons.push('리스크를 함께 검토할 수 있는 데이터가 있음')
  }

  if (reasons.length === 0) {
    reasons.push('현재 데이터 기준으로 종합 평가가 더 높음')
  }

  return reasons
}

export default function CompareClient() {
  const [targets, setTargets] = useState<Target[]>([])
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTargets() {
      const { data, error } = await supabase
        .from('transfer_targets_view')
        .select('*')
        .order('fit_score', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      setTargets(data ?? [])

      if (data && data.length >= 2) {
        setLeftId(String(data[0].case_id))
        setRightId(String(data[1].case_id))
      }
    }

    fetchTargets()
  }, [])

  const leftPlayer = useMemo(
    () => targets.find((player) => String(player.case_id) === leftId) ?? null,
    [targets, leftId]
  )

  const rightPlayer = useMemo(
    () => targets.find((player) => String(player.case_id) === rightId) ?? null,
    [targets, rightId]
  )

  const winner = getWinner(leftPlayer, rightPlayer)
  const summary = getWinnerText(leftPlayer, rightPlayer)

  const leftIsWinner = Boolean(
    winner && leftPlayer && winner.case_id === leftPlayer.case_id
  )

  const rightIsWinner = Boolean(
    winner && rightPlayer && winner.case_id === rightPlayer.case_id
  )

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/"
          className="mb-8 inline-flex rounded-full bg-[#111827] px-5 py-3 text-sm font-black text-[#8FB8FF] no-underline transition hover:bg-[#172036] hover:text-white"
        >
          ← 메인으로 돌아가기
        </Link>

        <section className="mb-9 rounded-[32px] bg-[#0b1020] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-10">
          <p className="mb-3 text-[12px] font-black tracking-[3px] text-[#8FB8FF]">
            PLAYER COMPARISON
          </p>

          <h1 className="mb-4 text-4xl font-black tracking-[-1px] text-white sm:text-5xl">
            후보 비교
          </h1>

          <p className="max-w-[760px] text-base leading-8 text-[#A0A0A0] sm:text-lg">
            두 명의 이적 후보를 선택해 전술 적합도, 리스크, 장점/단점, 역할을
            비교합니다.
          </p>
        </section>

        {error ? (
          <p className="mb-6 rounded-2xl bg-rose-500/10 p-4 font-bold text-rose-300">
            오류: {error}
          </p>
        ) : null}

        <section className="mb-7 grid gap-5 rounded-[30px] bg-[#0b1020] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] md:grid-cols-2 sm:p-8">
          <SelectBox title="왼쪽 선수" value={leftId} onChange={setLeftId} targets={targets} />
          <SelectBox title="오른쪽 선수" value={rightId} onChange={setRightId} targets={targets} />
        </section>

        <section className="mb-7 rounded-[30px] bg-[#111827] p-7 shadow-[0_20px_70px_rgba(0,0,0,0.22)] sm:p-8">
          <p className="mb-3 text-sm font-black tracking-[2px] text-[#8FB8FF]">비교 결론</p>
          <h2 className="m-0 text-2xl font-black leading-normal text-white sm:text-3xl">
            {summary}
          </h2>
        </section>

        <section className="mb-7 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <PlayerCompareCard player={leftPlayer} label="LEFT" isWinner={leftIsWinner} />

          <div className="flex items-center justify-center rounded-[26px] bg-[#0b1020] px-6 py-4 text-2xl font-black text-[#8FB8FF] shadow-[0_18px_60px_rgba(0,0,0,0.22)] lg:text-4xl">
            VS
          </div>

          <PlayerCompareCard player={rightPlayer} label="RIGHT" isWinner={rightIsWinner} />
        </section>

        {leftPlayer && rightPlayer ? (
          <>
            <SectionCard title="전술 적합도 중앙 비교">
              <CentralFitBar
                leftName={leftPlayer.name}
                rightName={rightPlayer.name}
                leftScore={leftPlayer.fit_score ?? 0}
                rightScore={rightPlayer.fit_score ?? 0}
              />
            </SectionCard>

            <SectionCard
              title="능력 비교"
              description="기존 단순 바보다 더 직관적으로 보이도록 좌우 대칭형 프로그레스 바와 점수 강조 UI로 개선했습니다."
            >
              <div className="grid gap-5">
                {traits.map((trait) => (
                  <TraitRow
                    key={trait}
                    title={trait}
                    left={getTraitScore(leftPlayer, trait)}
                    right={getTraitScore(rightPlayer, trait)}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="핵심 비교">
              <div className="grid gap-3">
                <CompareRow
                  title="전술 적합도"
                  left={`${leftPlayer.fit_score ?? 0}/100`}
                  right={`${rightPlayer.fit_score ?? 0}/100`}
                  leftWin={(leftPlayer.fit_score ?? 0) > (rightPlayer.fit_score ?? 0)}
                  rightWin={(rightPlayer.fit_score ?? 0) > (leftPlayer.fit_score ?? 0)}
                />

                <CompareRow title="예상 이적료" left={leftPlayer.fee ?? '-'} right={rightPlayer.fee ?? '-'} chip />
                <CompareRow title="신뢰도" left={leftPlayer.trust_level ?? '-'} right={rightPlayer.trust_level ?? '-'} chip />
                <CompareRow title="출처" left={leftPlayer.source ?? '-'} right={rightPlayer.source ?? '-'} chip />
                <CompareRow title="기자 Tier" left={leftPlayer.reliability_tier ?? '-'} right={rightPlayer.reliability_tier ?? '-'} chip />
                <CompareRow title="루머 날짜" left={formatRumorDate(leftPlayer.rumor_date)} right={formatRumorDate(rightPlayer.rumor_date)} />
                <CompareRow title="즉시전력감" left={leftPlayer.ready_now ?? '-'} right={rightPlayer.ready_now ?? '-'} />
                <CompareRow title="포지션" left={leftPlayer.position ?? '-'} right={rightPlayer.position ?? '-'} />
              </div>
            </SectionCard>

            <SectionCard title="장점 vs 장점">
              <ProsVersus
                leftName={leftPlayer.name}
                rightName={rightPlayer.name}
                leftItems={leftPlayer.pros ?? []}
                rightItems={rightPlayer.pros ?? []}
              />
            </SectionCard>

            <section className="grid gap-6 lg:grid-cols-2">
              <AnalysisCard title={`${leftPlayer.name} 분석`} player={leftPlayer} />
              <AnalysisCard title={`${rightPlayer.name} 분석`} player={rightPlayer} />
            </section>

            <FinalRecommendation left={leftPlayer} right={rightPlayer} winner={winner} />
          </>
        ) : null}

        <p className="mt-10 text-[13px] leading-6 text-[#A0A0A0]">
          본 사이트는 팬 제작 비공식 분석 플랫폼입니다. Tottenham Hotspur와 공식
          제휴된 서비스가 아닙니다.
        </p>
      </div>
    </main>
  )
}

function SelectBox({
  title,
  value,
  onChange,
  targets,
}: {
  title: string
  value: string
  onChange: (value: string) => void
  targets: Target[]
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-black tracking-[1px] text-white">
        {title}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl bg-[#111827] p-4 text-base font-bold text-white outline-none ring-1 ring-white/5 transition focus:ring-2 focus:ring-[#8FB8FF]"
      >
        <option value="">선수 선택</option>
        {targets.map((player) => (
          <option key={player.case_id} value={player.case_id}>
            {player.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function PlayerCompareCard({
  player,
  label,
  isWinner,
}: {
  player: Target | null
  label: string
  isWinner: boolean
}) {
  if (!player) {
    return (
      <section className="flex min-h-[300px] items-center justify-center rounded-[30px] bg-[#0b1020] p-8 text-[#A0A0A0] shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:min-h-[340px]">
        {label} 선수 선택 필요
      </section>
    )
  }

  const score = player.fit_score ?? 0
  const scoreColor = getScoreColor(score)

  return (
    <section
      className="relative overflow-hidden rounded-[30px] bg-[#0b1020] p-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-9"
      style={{
        boxShadow: isWinner
          ? '0 28px 90px rgba(143,184,255,0.2)'
          : '0 24px 80px rgba(0,0,0,0.3)',
      }}
    >
      {isWinner ? (
        <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#8FB8FF] px-5 py-3 text-xs font-black text-[#050816]">
          BEST FIT FOR SPURS
        </div>
      ) : null}

      <p className="mb-6 text-sm font-black tracking-[2px] text-[#8FB8FF]">
        {label} {isWinner ? '· 추천 우위' : ''}
      </p>

      <div className="flex items-center gap-5">
        <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[24px] bg-[#111827] text-2xl font-black text-white shadow-inner">
          {getInitials(player.name)}
        </div>

        <div>
          <h2 className="m-0 text-2xl font-black tracking-[-0.5px] text-white sm:text-3xl">
            {player.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#A0A0A0] sm:text-base">
            {player.position ?? '-'} · {player.age ?? '-'}세 · {player.current_team ?? '-'}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-[#111827] p-5">
        <div className="mb-3 flex justify-between gap-4 text-sm text-[#A0A0A0]">
          <span>전술 적합도</span>
          <strong className="text-lg" style={{ color: scoreColor }}>
            {score}/100
          </strong>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#1f2937]">
          <div
            className="h-full rounded-full"
            style={{ width: `${score}%`, background: scoreColor }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Badge label="상태" value={player.status ?? '-'} />
        <Badge label="신뢰도" value={player.trust_level ?? '-'} />
        <Badge label="이적료" value={player.fee ?? '-'} />
        <Badge label="출처" value={player.source ?? '-'} />
        <Badge label="기자 Tier" value={player.reliability_tier ?? '-'} />
        <Badge label="루머 날짜" value={formatRumorDate(player.rumor_date)} />
      </div>
    </section>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-7 rounded-[30px] bg-[#0b1020] p-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-9">
      <div className="mb-7">
        <h2 className="mb-2 mt-0 text-2xl font-black tracking-[-0.4px] text-white">
          {title}
        </h2>

        {description ? (
          <p className="m-0 max-w-[760px] leading-7 text-[#A0A0A0]">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  )
}

function CentralFitBar({
  leftName,
  rightName,
  leftScore,
  rightScore,
}: {
  leftName: string
  rightName: string
  leftScore: number
  rightScore: number
}) {
  return (
    <div className="rounded-[26px] bg-[#111827] p-6">
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <strong className="truncate text-left text-white">{leftName}</strong>
        <span className="rounded-full bg-[#0b1020] px-4 py-2 text-sm font-black text-[#8FB8FF]">
          VS
        </span>
        <strong className="truncate text-right text-white">{rightName}</strong>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 overflow-hidden rounded-full bg-[#1f2937]">
          <div
            className="h-full rounded-full"
            style={{
              marginLeft: 'auto',
              width: `${leftScore}%`,
              background: getScoreColor(leftScore),
            }}
          />
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-[#1f2937]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${rightScore}%`,
              background: getScoreColor(rightScore),
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <strong className="text-lg" style={{ color: getScoreColor(leftScore) }}>
          {leftScore}/100
        </strong>
        <span className="text-sm text-[#A0A0A0]">전술 적합도</span>
        <strong className="text-right text-lg" style={{ color: getScoreColor(rightScore) }}>
          {rightScore}/100
        </strong>
      </div>
    </div>
  )
}

function Badge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-sm">
      <span className="font-bold text-[#A0A0A0]">{label}</span>
      <strong className="font-black text-white">{value}</strong>
    </div>
  )
}

function ChipValue({ value }: { value: string }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full bg-[#111827] px-4 py-2 text-sm font-black text-white">
      <span className="truncate">{value}</span>
    </span>
  )
}

function TraitRow({ title, left, right }: { title: string; left: number; right: number }) {
  const leftWin = left > right
  const rightWin = right > left

  return (
    <div className="rounded-[24px] bg-[#111827] p-5">
      <div className="mb-4 grid grid-cols-[1fr_90px_1fr] items-center gap-4 sm:grid-cols-[1fr_120px_1fr]">
        <strong
          className="text-lg font-black"
          style={{ color: leftWin ? getScoreColor(left) : '#A0A0A0' }}
        >
          {left}
        </strong>

        <p className="m-0 text-center text-sm font-black tracking-[1px] text-white">
          {title}
        </p>

        <strong
          className="text-right text-lg font-black"
          style={{ color: rightWin ? getScoreColor(right) : '#A0A0A0' }}
        >
          {right}
        </strong>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="h-3 overflow-hidden rounded-full bg-[#1f2937]">
          <div
            className="h-full rounded-full"
            style={{
              marginLeft: 'auto',
              width: `${left}%`,
              background: getScoreColor(left),
            }}
          />
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#1f2937]">
          <div
            className="h-full rounded-full"
            style={{ width: `${right}%`, background: getScoreColor(right) }}
          />
        </div>
      </div>
    </div>
  )
}

function CompareRow({
  title,
  left,
  right,
  leftWin,
  rightWin,
  chip,
}: {
  title: string
  left: string
  right: string
  leftWin?: boolean
  rightWin?: boolean
  chip?: boolean
}) {
  return (
    <div className="grid grid-cols-[1fr_100px_1fr] items-center gap-4 rounded-[22px] bg-[#111827] p-4 sm:grid-cols-[1fr_170px_1fr] sm:p-5">
      <div className="min-w-0">
        {chip ? (
          <ChipValue value={left} />
        ) : (
          <strong
            className="block truncate text-base font-black sm:text-lg"
            style={{ color: leftWin ? '#4ade80' : '#ffffff' }}
          >
            {left}
          </strong>
        )}
      </div>

      <p className="m-0 text-center text-xs font-bold text-[#A0A0A0] sm:text-sm">
        {title}
      </p>

      <div className="min-w-0 text-right">
        {chip ? (
          <ChipValue value={right} />
        ) : (
          <strong
            className="block truncate text-base font-black sm:text-lg"
            style={{ color: rightWin ? '#4ade80' : '#ffffff' }}
          >
            {right}
          </strong>
        )}
      </div>
    </div>
  )
}

function ProsVersus({
  leftName,
  rightName,
  leftItems,
  rightItems,
}: {
  leftName: string
  rightName: string
  leftItems: string[]
  rightItems: string[]
}) {
  const max = Math.max(leftItems.length, rightItems.length, 3)
  const rows = Array.from({ length: max })

  return (
    <div>
      <div className="mb-4 grid grid-cols-[1fr_60px_1fr] gap-3 text-sm font-black text-[#8FB8FF]">
        <span>{leftName}</span>
        <span className="text-center">VS</span>
        <span className="text-right">{rightName}</span>
      </div>

      <div className="grid gap-4">
        {rows.map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_60px_1fr] items-center gap-4 rounded-[22px] bg-[#111827] p-5"
          >
            <p className="m-0 leading-7 text-[#D1D5DB]">{leftItems[index] ?? '-'}</p>
            <p className="m-0 text-center text-xs font-black text-[#8FB8FF]">VS</p>
            <p className="m-0 text-right leading-7 text-[#D1D5DB]">
              {rightItems[index] ?? '-'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalysisCard({ title, player }: { title: string; player: Target }) {
  return (
    <section className="rounded-[30px] bg-[#0b1020] p-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-9">
      <h2 className="mb-7 mt-0 text-2xl font-black tracking-[-0.4px] text-white">
        {title}
      </h2>

      <Block title="한줄 결론" value={player.conclusion ?? '정보 없음'} />
      <Block title="전술 역할" value={player.role_summary ?? '정보 없음'} />
      <Block title="리스크" value={player.risk_summary ?? '정보 없음'} />
      <Block title="케미 좋은 선수" value={player.chemistry ?? '정보 없음'} />

      <ListBlock title="장점" items={player.pros ?? []} />
      <ListBlock title="단점" items={player.cons ?? []} />
    </section>
  )
}

function FinalRecommendation({
  left,
  right,
  winner,
}: {
  left: Target
  right: Target
  winner: Target | null
}) {
  const reasons = getRecommendationReasons(left, right, winner)

  return (
    <section className="mt-7 rounded-[34px] bg-[linear-gradient(135deg,#081225_0%,#0b1b3a_55%,#102a56_100%)] p-8 text-white shadow-[0_30px_100px_rgba(143,184,255,0.22)] sm:p-10">
      <p className="mb-3 text-sm font-black tracking-[3px] text-[#8FB8FF]">
        FINAL RECOMMENDATION
      </p>

      <h2 className="mb-6 mt-0 text-3xl font-black tracking-[-0.6px] text-white">
        추천 영입: {winner ? winner.name : '판단 보류'}
      </h2>

      <ul className="m-0 grid gap-3 pl-5 leading-8 text-[#D1D5DB]">
        {reasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
    </section>
  )
}

function Block({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-6 rounded-[22px] bg-[#111827] p-5">
      <p className="mb-2 font-black text-[#8FB8FF]">{title}</p>
      <p className="m-0 leading-7 text-[#D1D5DB]">{value}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-6 rounded-[22px] bg-[#111827] p-5">
      <p className="mb-3 font-black text-[#8FB8FF]">{title}</p>

      {items.length > 0 ? (
        <ul className="m-0 grid gap-2 pl-5 leading-8 text-[#D1D5DB]">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[#A0A0A0]">정보 없음</p>
      )}
    </div>
  )
}