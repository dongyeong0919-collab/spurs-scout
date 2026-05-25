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
  if (status === 'talks') return '#8FB8FF'
  if (status === 'interest') return '#3b82f6'
  if (status === 'linked') return '#64748b'
  if (status === 'verbal') return '#7c3aed'
  if (status === 'official') return '#22c55e'
  return '#475569'
}

function getScoreColor(score: number) {
  if (score >= 85) return '#4ade80'
  if (score >= 70) return '#8FB8FF'
  return '#f87171'
}

function getProbabilityColor(score: number) {
  if (score >= 70) return '#4ade80'
  if (score >= 40) return '#8FB8FF'
  return '#f87171'
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: 'easeOut',
      }}
      className="group relative overflow-hidden rounded-[30px] border border-[#26314f] bg-[#0b1020] p-5 text-white shadow-[0_18px_55px_rgba(11,16,32,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#8FB8FF] hover:shadow-[0_22px_70px_rgba(143,184,255,0.12)] sm:p-6"
    >
      <button
        type="button"
        aria-label={isFavorite ? '관심 선수 해제' : '관심 선수 추가'}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggleFavorite(player.slug)
        }}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#26314f] bg-[#11162a] text-lg text-white transition-all duration-300 hover:border-[#8FB8FF] hover:text-[#8FB8FF]"
      >
        {isFavorite ? '★' : '☆'}
      </button>

      <Link
        href={`/player/${player.slug}`}
        className="block text-white no-underline"
      >
        <div className="flex gap-4 pr-12">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black tracking-tight text-[#050816]">
            {getInitials(player.name)}
          </div>

          <div className="min-w-0 pt-1">
            <h3 className="truncate text-2xl font-black tracking-tight text-white">
              {player.name}
            </h3>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-white/65">
              <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#11162a] px-2 text-[10px] font-black text-white">
                {getTeamInitials(player.current_team)}
              </span>

              <span className="truncate">
                {player.position ?? '-'} · {player.current_team ?? '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white"
            style={{
              background: getStatusColor(player.status),
            }}
          >
            {player.status ?? 'unknown'}
          </span>
        </div>

        <div className="mt-5 space-y-3">
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

        <p className="mt-5 line-clamp-2 min-h-[52px] text-sm leading-7 text-white/72">
          {player.conclusion ?? '아직 한줄 결론이 입력되지 않았습니다.'}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="min-w-0 truncate text-xs font-medium text-white/45">
            {player.source ?? '출처 준비 중'}
          </span>

          <span className="shrink-0 rounded-full border border-[#8FB8FF] px-4 py-2 text-xs font-black text-[#8FB8FF] transition-all duration-300 group-hover:bg-[#8FB8FF] group-hover:text-[#050816]">
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
    <div className="rounded-2xl border border-[#26314f] bg-[#11162a] p-3.5">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-white/60">{label}</span>

        <strong
          className="shrink-0 font-black"
          style={{ color }}
        >
          {value}
        </strong>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#050816]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safePercent}%` }}
          transition={{
            duration: 0.85,
            ease: 'easeOut',
          }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}