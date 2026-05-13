'use client'

import Link from 'next/link'
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
  scout_tier: string | null
  conclusion: string | null
  ready_now: string | null
  risk_summary: string | null
  role_summary: string | null
  chemistry: string | null
  pros: string[] | null
  cons: string[] | null
}

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
  if (score >= 70) return '#facc15'
  return '#f87171'
}

function getTierValue(tier: string | null) {
  const order: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 }
  return order[tier ?? ''] ?? 0
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
  const leftTier = getTierValue(left.scout_tier)
  const rightTier = getTierValue(right.scout_tier)

  const leftTotal = leftScore + leftTier * 4
  const rightTotal = rightScore + rightTier * 4

  if (leftTotal > rightTotal) return left
  if (rightTotal > leftTotal) return right
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
      'Scout Tier와 리스크를 함께 비교 필요',
      '포지션 역할에 따라 선택이 달라질 수 있음',
    ]
  }

  const loser = winner.case_id === left.case_id ? right : left
  const reasons: string[] = []

  if ((winner.fit_score ?? 0) > (loser.fit_score ?? 0)) {
    reasons.push('전술 적합도 점수가 더 높음')
  }

  if (getTierValue(winner.scout_tier) > getTierValue(loser.scout_tier)) {
    reasons.push('Scout Tier가 더 높음')
  }

  if (winner.ready_now && winner.ready_now !== '-') {
    reasons.push('즉시전력감 판단 근거가 있음')
  }

  if (winner.pros && winner.pros.length > 0) {
    reasons.push('장점 데이터가 더 명확하게 정리됨')
  }

  if (reasons.length === 0) {
    reasons.push('종합 점수 기준으로 근소하게 우세')
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#17213a_0%,#0b1020_45%,#050816_100%)] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/"
          className="mb-6 inline-block font-extrabold text-[#c6a96b] no-underline"
        >
          ← 메인으로 돌아가기
        </Link>

        <section className="mb-7">
          <p className="mb-2 text-[13px] font-black tracking-[3px] text-[#c6a96b]">
            PLAYER COMPARISON
          </p>

          <h1 className="mb-3 text-3xl font-black sm:text-5xl">후보 비교</h1>

          <p className="max-w-[720px] leading-8 text-[#a8b0c2]">
            두 명의 이적 후보를 선택해 전술 적합도, Scout Tier, 리스크,
            장점/단점, 역할을 비교합니다.
          </p>
        </section>

        {error ? <p className="mb-5 text-[#f87171]">오류: {error}</p> : null}

        <section className="mb-6 grid gap-4 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.9)] p-5 md:grid-cols-2">
          <SelectBox title="왼쪽 선수" value={leftId} onChange={setLeftId} targets={targets} />
          <SelectBox title="오른쪽 선수" value={rightId} onChange={setRightId} targets={targets} />
        </section>

        <section className="mb-6 rounded-[26px] border border-[rgba(198,169,107,0.3)] bg-[linear-gradient(135deg,rgba(198,169,107,0.16),rgba(17,22,42,0.94))] p-5 sm:p-6">
          <p className="mb-2 font-black text-[#c6a96b]">비교 결론</p>
          <h2 className="m-0 text-xl leading-normal sm:text-2xl">{summary}</h2>
        </section>

        <section className="mb-6 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <PlayerCompareCard player={leftPlayer} label="LEFT" isWinner={leftIsWinner} />

          <div className="flex items-center justify-center px-2 text-2xl font-black text-[#c6a96b] lg:text-4xl">
            VS
          </div>

          <PlayerCompareCard player={rightPlayer} label="RIGHT" isWinner={rightIsWinner} />
        </section>

        {leftPlayer && rightPlayer ? (
          <>
            <section className="mb-6 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
              <h2 className="mb-5 mt-0 text-2xl">전술 적합도 중앙 비교</h2>

              <CentralFitBar
                leftName={leftPlayer.name}
                rightName={rightPlayer.name}
                leftScore={leftPlayer.fit_score ?? 0}
                rightScore={rightPlayer.fit_score ?? 0}
              />
            </section>

            <section className="mb-6 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
              <h2 className="mb-5 mt-0 text-2xl">능력 비교</h2>

              {['창의성', '압박', '침투', '연계', '결정력', '속도'].map((trait) => (
                <TraitRow
                  key={trait}
                  title={trait}
                  left={getTraitScore(leftPlayer, trait)}
                  right={getTraitScore(rightPlayer, trait)}
                />
              ))}
            </section>

            <section className="mb-6 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
              <h2 className="mb-5 mt-0 text-2xl">핵심 비교</h2>

              <CompareRow
                title="전술 적합도"
                left={`${leftPlayer.fit_score ?? 0}/100`}
                right={`${rightPlayer.fit_score ?? 0}/100`}
                leftWin={(leftPlayer.fit_score ?? 0) > (rightPlayer.fit_score ?? 0)}
                rightWin={(rightPlayer.fit_score ?? 0) > (leftPlayer.fit_score ?? 0)}
              />

              <CompareRow
                title="Scout Tier"
                left={leftPlayer.scout_tier ?? '-'}
                right={rightPlayer.scout_tier ?? '-'}
                leftWin={getTierValue(leftPlayer.scout_tier) > getTierValue(rightPlayer.scout_tier)}
                rightWin={getTierValue(rightPlayer.scout_tier) > getTierValue(leftPlayer.scout_tier)}
              />

              <CompareRow title="예상 이적료" left={leftPlayer.fee ?? '-'} right={rightPlayer.fee ?? '-'} />
              <CompareRow title="신뢰도" left={leftPlayer.trust_level ?? '-'} right={rightPlayer.trust_level ?? '-'} />
              <CompareRow title="출처" left={leftPlayer.source ?? '-'} right={rightPlayer.source ?? '-'} />
              <CompareRow title="기자 Tier" left={leftPlayer.reliability_tier ?? '-'} right={rightPlayer.reliability_tier ?? '-'} />
              <CompareRow title="루머 날짜" left={formatRumorDate(leftPlayer.rumor_date)} right={formatRumorDate(rightPlayer.rumor_date)} />
              <CompareRow title="즉시전력감" left={leftPlayer.ready_now ?? '-'} right={rightPlayer.ready_now ?? '-'} />
              <CompareRow title="포지션" left={leftPlayer.position ?? '-'} right={rightPlayer.position ?? '-'} />
            </section>

            <section className="mb-6 rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
              <h2 className="mb-5 mt-0 text-2xl">장점 vs 장점</h2>

              <ProsVersus
                leftName={leftPlayer.name}
                rightName={rightPlayer.name}
                leftItems={leftPlayer.pros ?? []}
                rightItems={rightPlayer.pros ?? []}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <AnalysisCard title={`${leftPlayer.name} 분석`} player={leftPlayer} />
              <AnalysisCard title={`${rightPlayer.name} 분석`} player={rightPlayer} />
            </section>

            <FinalRecommendation left={leftPlayer} right={rightPlayer} winner={winner} />
          </>
        ) : null}

        <p className="mt-9 text-[13px] text-[#777]">
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
    <label className="block font-extrabold text-[#f7f4e7]">
      {title}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-[#33415f] bg-[#0b1020] p-3.5 text-white"
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
      <section className="flex min-h-[260px] items-center justify-center rounded-[26px] border border-dashed border-[#33415f] bg-[rgba(17,22,42,0.94)] p-5 text-[#94a3b8] sm:min-h-[320px] sm:p-7">
        {label} 선수 선택 필요
      </section>
    )
  }

  const score = player.fit_score ?? 0
  const scoreColor = getScoreColor(score)

  return (
    <section
      className="relative overflow-hidden rounded-[26px] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7"
      style={{
        border: isWinner ? '1px solid #c6a96b' : '1px solid #26314f',
        boxShadow: isWinner ? '0 0 44px rgba(198,169,107,0.24)' : 'none',
      }}
    >
      {isWinner ? (
        <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#c6a96b] px-4 py-2 text-xs font-black text-[#0b1020]">
          BEST FIT FOR SPURS
        </div>
      ) : null}

      <p className="mb-5 font-black text-[#c6a96b]">
        {label} {isWinner ? '· 추천 우위' : ''}
      </p>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#c6a96b_0%,#6b5a2e_100%)] text-xl font-black text-[#0b1020] sm:h-[70px] sm:w-[70px] sm:text-2xl">
          {getInitials(player.name)}
        </div>

        <div>
          <h2 className="m-0 text-2xl sm:text-3xl">{player.name}</h2>
          <p className="mt-2 text-sm text-[#a8b0c2] sm:text-base">
            {player.position ?? '-'} · {player.age ?? '-'}세 · {player.current_team ?? '-'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-[#a8b0c2]">
          <span>전술 적합도</span>
          <strong style={{ color: scoreColor }}>{score}/100</strong>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-[#0b1020]">
          <div style={{ width: `${score}%`, height: '100%', background: scoreColor }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniInfo title="Tier" value={player.scout_tier ?? '-'} />
        <MiniInfo title="상태" value={player.status ?? '-'} />
        <MiniInfo title="신뢰도" value={player.trust_level ?? '-'} />
        <MiniInfo title="이적료" value={player.fee ?? '-'} />
        <MiniInfo title="출처" value={player.source ?? '-'} />
        <MiniInfo title="기자 Tier" value={player.reliability_tier ?? '-'} />
      </div>
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
    <div>
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <strong className="truncate text-left">{leftName}</strong>
        <span className="font-black text-[#c6a96b]">VS</span>
        <strong className="truncate text-right">{rightName}</strong>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="h-4 overflow-hidden rounded-full bg-[#0b1020]">
          <div
            style={{
              marginLeft: 'auto',
              width: `${leftScore}%`,
              height: '100%',
              background: getScoreColor(leftScore),
            }}
          />
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-[#0b1020]">
          <div
            style={{
              width: `${rightScore}%`,
              height: '100%',
              background: getScoreColor(rightScore),
            }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <strong style={{ color: getScoreColor(leftScore) }}>{leftScore}/100</strong>
        <span className="text-sm text-[#94a3b8]">전술 적합도</span>
        <strong className="text-right" style={{ color: getScoreColor(rightScore) }}>
          {rightScore}/100
        </strong>
      </div>
    </div>
  )
}

function MiniInfo({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#26314f] bg-[#0b1020] p-3.5">
      <p className="mb-1.5 mt-0 text-[13px] text-[#94a3b8]">{title}</p>
      <strong>{value}</strong>
    </div>
  )
}

function TraitRow({ title, left, right }: { title: string; left: number; right: number }) {
  return (
    <div className="mb-5">
      <div className="mb-2 grid grid-cols-[1fr_80px_1fr] items-center gap-3 sm:grid-cols-[1fr_100px_1fr]">
        <strong style={{ color: left > right ? '#4ade80' : '#f3f4f6' }}>{left}</strong>
        <p className="m-0 text-center font-black text-[#c6a96b]">{title}</p>
        <strong className="text-right" style={{ color: right > left ? '#4ade80' : '#f3f4f6' }}>
          {right}
        </strong>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="h-2.5 overflow-hidden rounded-full bg-[#0b1020]">
          <div
            style={{
              marginLeft: 'auto',
              width: `${left}%`,
              height: '100%',
              background: getScoreColor(left),
            }}
          />
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-[#0b1020]">
          <div style={{ width: `${right}%`, height: '100%', background: getScoreColor(right) }} />
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
}: {
  title: string
  left: string
  right: string
  leftWin?: boolean
  rightWin?: boolean
}) {
  return (
    <div className="grid grid-cols-[1fr_110px_1fr] items-center gap-3 border-b border-[#26314f] py-3.5 sm:grid-cols-[1fr_180px_1fr]">
      <strong style={{ color: leftWin ? '#4ade80' : '#f3f4f6' }}>{left}</strong>
      <p className="m-0 text-center text-sm text-[#94a3b8] sm:text-base">{title}</p>
      <strong className="text-right" style={{ color: rightWin ? '#4ade80' : '#f3f4f6' }}>
        {right}
      </strong>
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
      <div className="mb-3 grid grid-cols-[1fr_60px_1fr] gap-3 text-sm font-black text-[#c6a96b]">
        <span>{leftName}</span>
        <span className="text-center">VS</span>
        <span className="text-right">{rightName}</span>
      </div>

      <div className="grid gap-3">
        {rows.map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_60px_1fr] items-center gap-3 rounded-2xl border border-[#26314f] bg-[#0b1020] p-3"
          >
            <p className="m-0 text-[#d1d5db]">{leftItems[index] ?? '-'}</p>
            <p className="m-0 text-center text-xs font-black text-[#c6a96b]">VS</p>
            <p className="m-0 text-right text-[#d1d5db]">{rightItems[index] ?? '-'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalysisCard({ title, player }: { title: string; player: Target }) {
  return (
    <section className="rounded-3xl border border-[#26314f] bg-[rgba(17,22,42,0.94)] p-5 sm:p-7">
      <h2 className="mb-5 mt-0 text-2xl">{title}</h2>

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
    <section className="mt-6 rounded-3xl border border-[rgba(198,169,107,0.35)] bg-[linear-gradient(135deg,rgba(198,169,107,0.18),rgba(17,22,42,0.94))] p-5 sm:p-7">
      <p className="mb-2 text-sm font-black tracking-[2px] text-[#c6a96b]">
        FINAL RECOMMENDATION
      </p>

      <h2 className="mb-4 mt-0 text-2xl">
        추천 영입: {winner ? winner.name : '판단 보류'}
      </h2>

      <ul className="m-0 grid gap-2 pl-5 leading-7 text-[#f3f4f6]">
        {reasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
    </section>
  )
}

function Block({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-5">
      <p className="mb-1.5 font-black text-[#c6a96b]">{title}</p>
      <p className="m-0 leading-7 text-[#d1d5db]">{value}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5">
      <p className="mb-2 font-black text-[#c6a96b]">{title}</p>

      {items.length > 0 ? (
        <ul className="pl-5 leading-8 text-[#d1d5db]">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-[#94a3b8]">정보 없음</p>
      )}
    </div>
  )
}