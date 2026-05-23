'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type PlayerCardProps = {
  player: {
    case_id: number
    name: string
    slug: string
    status: string | null
    fit_score: number | null
    current_team: string | null
    conclusion: string | null
    position: string | null
    source: string | null
    transfer_probability: number | null
  }
  index: number
  isFavorite: boolean
  onToggleFavorite: (slug: string) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getTeamInitials(team: string | null) {
  if (!team) return '-'

  return team
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
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
  if (score >= 85) return '#7ee081'
  if (score >= 70) return '#f4d35e'
  return '#ff7b7b'
}

function getProbabilityColor(score: number) {
  if (score >= 70) return '#7ee081'
  if (score >= 40) return '#f4d35e'
  return '#ff7b7b'
}

export default function PlayerCard({
  player,
  index,
  isFavorite,
  onToggleFavorite,
}: PlayerCardProps) {
  const score = Math.min(Math.max(player.fit_score ?? 0, 0), 100)
  const probability = Math.min(
    Math.max(player.transfer_probability ?? 0, 0),
    100
  )

  const scoreColor = getScoreColor(score)
  const probabilityColor = getProbabilityColor(probability)

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: 'easeOut',
      }}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.035] sm:p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-70" />

      <button
        type="button"
        aria-label={isFavorite ? '관심 선수 해제' : '관심 선수 추가'}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggleFavorite(player.slug)
        }}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#11162a]/95 text-lg text-white shadow-sm transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-[#050816]"
      >
        {isFavorite ? '⭐' : '☆'}
      </button>

      <Link href={`/player/${player.slug}`} className="block text-white no-underline">
        <div className="flex gap-4 pr-12">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black tracking-tight text-[#050816] shadow-[0_10px_24px_rgba(255,255,255,0.12)]">
            {getInitials(player.name)}
          </div>

          <div className="min-w-0 pt-0.5">
            <h3 className="truncate text-xl font-black tracking-tight text-white">
              {player.name}
            </h3>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-white/65">
              <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-2 text-[10px] font-black text-white/90">
                {getTeamInitials(player.current_team)}
              </span>

              <span className="truncate">
                {player.position ?? '-'} · {player.current_team ?? '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-sm"
            style={{ background: getStatusColor(player.status) }}
          >
            {player.status ?? 'unknown'}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <ProgressBox
            label="이적 가능성"
            value={`${probability}%`}
            percent={probability}
            color={probabilityColor}
          />

          <ProgressBox
            label="전술 적합도"
            value={`${score}/100`}
            percent={score}
            color={scoreColor}
          />
        </div>

        <p className="mt-4 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/75">
          {player.conclusion ?? '아직 한줄 결론이 입력되지 않았습니다.'}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="min-w-0 truncate text-xs font-medium text-white/45">
            {player.source ?? '출처 준비 중'}
          </span>

          <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-black text-[#050816] transition-all duration-300 group-hover:scale-[1.03]">
            자세히 보기 →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

function ProgressBox({
  label,
  value,
  percent,
  color,
}: {
  label: string
  value: string
  percent: number
  color: string
}) {
  const safePercent = Math.min(Math.max(percent, 0), 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-white/60">{label}</span>
        <strong className="shrink-0 font-black" style={{ color }}>
          {value}
        </strong>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#050816]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safePercent}%` }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}