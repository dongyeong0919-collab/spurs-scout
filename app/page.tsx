'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { posts } from './blog/posts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Target = {
  case_id: number
  name: string
  slug: string
  status: string | null
  fit_score: number | null
  current_team: string | null
  scout_tier: string | null
  conclusion: string | null
  position: string | null
  source: string | null
  reliability_tier: string | null
  rumor_date: string | null
  transfer_probability: number | null
  probability_confidence: string | null
  probability_summary: string | null
}

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

function getTierColor(tier: string | null) {
  if (tier === 'S') return '#facc15'
  if (tier === 'A') return '#4ade80'
  if (tier === 'B') return '#60a5fa'
  if (tier === 'C') return '#f97316'
  return '#64748b'
}

function getScoreColor(score: number) {
  if (score >= 85) return '#4ade80'
  if (score >= 70) return '#facc15'
  return '#f87171'
}

function getProbabilityColor(score: number) {
  if (score >= 70) return '#4ade80'
  if (score >= 40) return '#facc15'
  return '#f87171'
}

function formatRumorDate(value: string | null) {
  if (!value) return '-'
  return value.slice(0, 10)
}

export default function HomePage() {
  const latestPosts = posts.slice(0, 2)

  const [targets, setTargets] = useState<Target[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [tier, setTier] = useState('all')
  const [position, setPosition] = useState('all')
  const [sort, setSort] = useState('fit')
  const [favoriteOnly, setFavoriteOnly] = useState(false)

  useEffect(() => {
    async function fetchTargets() {
      const { data, error } = await supabase
        .from('transfer_targets_view')
        .select('*')

      if (error) {
        console.log(error)
        return
      }

      setTargets(data ?? [])
    }

    fetchTargets()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('spurs-scout-favorites')

    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }, [])

  function toggleFavorite(slug: string) {
    let updated: string[]

    if (favorites.includes(slug)) {
      updated = favorites.filter((item) => item !== slug)
    } else {
      updated = [...favorites, slug]
    }

    setFavorites(updated)
    localStorage.setItem('spurs-scout-favorites', JSON.stringify(updated))
  }

  const positionOptions = useMemo(() => {
    const unique = new Set(
      targets
        .map((player) => player.position)
        .filter((item): item is string => Boolean(item))
    )

    return Array.from(unique).sort()
  }, [targets])

  const filteredTargets = useMemo(() => {
    let result = [...targets]

    if (search.trim()) {
      const keyword = search.toLowerCase()

      result = result.filter((player) =>
        [
          player.name,
          player.current_team,
          player.conclusion,
          player.position,
          player.source,
          player.reliability_tier,
          player.probability_confidence,
          player.probability_summary,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      )
    }

    if (status !== 'all') {
      result = result.filter((player) => player.status === status)
    }

    if (tier !== 'all') {
      result = result.filter((player) => player.scout_tier === tier)
    }

    if (position !== 'all') {
      result = result.filter((player) => player.position === position)
    }

    if (favoriteOnly) {
      result = result.filter((player) => favorites.includes(player.slug))
    }

    if (sort === 'fit') {
      result.sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0))
    }

    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sort === 'tier') {
      const order: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 }

      result.sort(
        (a, b) =>
          (order[b.scout_tier ?? ''] ?? 0) -
          (order[a.scout_tier ?? ''] ?? 0)
      )
    }

    return result
  }, [targets, search, status, tier, position, sort, favoriteOnly, favorites])

  function resetFilters() {
    setSearch('')
    setStatus('all')
    setTier('all')
    setPosition('all')
    setSort('fit')
    setFavoriteOnly(false)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#17213a_0%,#0b1020_45%,#050816_100%)] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1220px]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <p className="mb-2 text-[13px] font-black tracking-[3px] text-[#c6a96b]">
            TRANSFER INTELLIGENCE
          </p>

          <h1 className="mb-3 text-4xl font-black tracking-wide text-white sm:text-5xl">
            SPURS SCOUT
          </h1>

          <p className="max-w-[690px] leading-8 text-[#a8b0c2]">
            Tottenham 팬들을 위한 비공식 이적 분석 플랫폼입니다. 루머를 단순히
            모으는 것이 아니라, 전술 적합도와 Scout Tier로 영입 가치를 판단합니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="rounded-2xl bg-[#c6a96b] px-5 py-3 font-black text-[#0b1020] no-underline transition hover:opacity-90"
            >
              후보 비교하기 →
            </Link>
<Link
  href="/admin"
  prefetch={false}
  className="rounded-2xl border border-[#c6a96b]/40 px-5 py-3 font-black text-[#c6a96b] no-underline transition hover:bg-[#c6a96b]/10"
>
  관리자 →
</Link>

<Link
  href="/privacy"
  className="rounded-2xl border border-[#c6a96b]/40 px-5 py-3 font-black text-[#c6a96b] no-underline transition hover:bg-[#c6a96b]/10"
>
  개인정보처리방침 →
</Link>
            <Link
              href="/blog"
              className="rounded-2xl border border-[#c6a96b]/40 px-5 py-3 font-black text-[#c6a96b] no-underline transition hover:bg-[#c6a96b]/10"
            >
              블로그 보기 →
            </Link>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mb-8 rounded-[22px] border border-[#26314f] bg-[rgba(17,22,42,0.78)] p-4"
        >
          <div className="grid gap-3 md:grid-cols-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="선수 이름 / 팀 / 출처 검색"
              className="rounded-2xl border border-[#33415f] bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-[#c6a96b] md:col-span-2"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-[#33415f] bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-[#c6a96b]"
            >
              <option value="all">전체 상태</option>
              <option value="linked">linked</option>
              <option value="interest">interest</option>
              <option value="talks">talks</option>
              <option value="verbal">verbal</option>
              <option value="official">official</option>
            </select>

            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="rounded-2xl border border-[#33415f] bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-[#c6a96b]"
            >
              <option value="all">전체 Tier</option>
              <option value="S">S Tier</option>
              <option value="A">A Tier</option>
              <option value="B">B Tier</option>
              <option value="C">C Tier</option>
              <option value="D">D Tier</option>
            </select>

            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="rounded-2xl border border-[#33415f] bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-[#c6a96b]"
            >
              <option value="all">전체 포지션</option>
              {positionOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border border-[#33415f] bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-[#c6a96b]"
            >
              <option value="fit">적합도 높은 순</option>
              <option value="tier">Scout 티어 높은 순</option>
              <option value="name">이름순</option>
            </select>

            <button
              type="button"
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`rounded-2xl border px-4 py-3 font-bold transition ${
                favoriteOnly
                  ? 'border-[#c6a96b] bg-[#c6a96b] text-[#0b1020]'
                  : 'border-[#33415f] bg-[#0b1020] text-white hover:border-[#c6a96b]'
              }`}
            >
              ⭐ 관심 선수
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#a8b0c2]">
              전체 {targets.length}명 · 표시 {filteredTargets.length}명 · 관심{' '}
              {favorites.length}명
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#c6a96b]/30 px-4 py-2 text-sm font-bold text-[#c6a96b] transition hover:bg-[#c6a96b]/10"
            >
              필터 초기화
            </button>
          </div>
        </motion.section>

        {filteredTargets.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#aaa]"
          >
            조건에 맞는 선수가 없습니다.
          </motion.p>
        ) : (
          <section className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {filteredTargets.map((player, index) => {
              const score = player.fit_score ?? 0
              const scoreColor = getScoreColor(score)
              const probability = Math.min(
                Math.max(player.transfer_probability ?? 0, 0),
                100
              )
              const probabilityColor = getProbabilityColor(probability)
              const tierColor = getTierColor(player.scout_tier)
              const isFavorite = favorites.includes(player.slug)

              return (
                <motion.div
                  key={player.case_id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      toggleFavorite(player.slug)
                    }}
                    className="absolute right-4 top-4 z-20 rounded-full border border-[#c6a96b]/30 bg-[#0b1020]/90 px-3 py-2 text-lg shadow-lg transition hover:scale-110 hover:border-[#c6a96b]"
                    aria-label="관심 선수 저장"
                  >
                    {isFavorite ? '⭐' : '☆'}
                  </button>

                  <Link
                    href={`/player/${player.slug}`}
                    className="text-white no-underline"
                  >
                    <motion.article
                      whileHover={{ y: -8, scale: 1.015 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 18,
                      }}
                      className="group flex h-full min-h-[470px] cursor-pointer flex-col rounded-[26px] border border-[#26314f] bg-[linear-gradient(180deg,rgba(17,22,42,0.96),rgba(10,14,26,0.96))] p-6 transition duration-300 hover:border-[#c6a96b] hover:shadow-[0_25px_60px_rgba(198,169,107,0.18)]"
                    >
                      <div className="mb-5 flex items-start justify-between gap-4 pr-12">
                        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#c6a96b_0%,#6b5a2e_100%)] text-xl font-black text-[#0b1020] transition group-hover:scale-105">
                          {getInitials(player.name)}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className="rounded-full px-2.5 py-1.5 text-xs font-black text-[#0b1020]"
                            style={{ background: tierColor }}
                          >
                            {player.scout_tier ?? '-'} TIER
                          </span>

                          <span
                            className="rounded-full px-3 py-1.5 text-xs font-extrabold uppercase text-white"
                            style={{ background: getStatusColor(player.status) }}
                          >
                            {player.status ?? 'unknown'}
                          </span>
                        </div>
                      </div>

                      <h2 className="mb-2 text-[27px]">{player.name}</h2>

                      <p className="mb-4 font-extrabold text-[#c6a96b]">
                        현재 소속팀: {player.current_team ?? '-'}
                      </p>

                      <div className="mb-5 grid gap-2 rounded-[18px] border border-[rgba(198,169,107,0.18)] bg-[rgba(198,169,107,0.06)] p-4">
                        <div className="flex flex-wrap gap-2">
                          <InfoPill>출처: {player.source ?? '-'}</InfoPill>
                          <InfoPill>{player.reliability_tier ?? '-'}</InfoPill>
                        </div>

                        <p className="text-[13px] font-semibold text-[#94a3b8]">
                          루머 날짜: {formatRumorDate(player.rumor_date)}
                        </p>
                      </div>

                      <div className="mb-5 rounded-[18px] border border-[rgba(198,169,107,0.18)] bg-[rgba(198,169,107,0.08)] p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-[13px] font-black text-[#c6a96b]">
                            Transfer Probability
                          </p>

                          <strong
                            className="text-xl"
                            style={{ color: probabilityColor }}
                          >
                            {probability}%
                          </strong>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full border border-[#1f2942] bg-[#0b1020]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${probability}%` }}
                            transition={{
                              duration: 0.7,
                              delay: 0.15 + index * 0.04,
                            }}
                            style={{
                              height: '100%',
                              borderRadius: 999,
                              background: probabilityColor,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[12px] font-bold text-[#94a3b8]">
                            Spurs Scout 추정치
                          </p>

                          {player.probability_confidence && (
                            <span className="rounded-full border border-[#c6a96b]/25 bg-[#111827] px-3 py-1 text-[12px] font-bold text-[#d7bd77]">
                              Confidence: {player.probability_confidence}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-6 rounded-[18px] border border-[rgba(198,169,107,0.18)] bg-[rgba(198,169,107,0.08)] p-4 transition group-hover:border-[rgba(198,169,107,0.35)]">
                        <p className="mb-2 text-[13px] font-black text-[#c6a96b]">
                          한줄 결론
                        </p>

                        <p className="m-0 text-[15px] leading-7 text-[#f3f4f6]">
                          {player.conclusion ??
                            '아직 한줄 결론이 입력되지 않았습니다.'}
                        </p>
                      </div>

                      <div className="mb-5">
                        <div className="mb-2 flex justify-between text-sm text-[#a8b0c2]">
                          <span>전술 적합도</span>
                          <strong style={{ color: scoreColor }}>{score}/100</strong>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full border border-[#1f2942] bg-[#0b1020]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{
                              duration: 0.7,
                              delay: 0.15 + index * 0.04,
                            }}
                            style={{
                              height: '100%',
                              borderRadius: 999,
                              background: scoreColor,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#26314f] pt-4">
                        <span className="text-[13px] text-[#94a3b8]">
                          Scout Report 보기
                        </span>

                        <span className="rounded-full bg-[#c6a96b] px-3 py-2 text-[13px] font-black text-[#0b1020] transition group-hover:bg-[#d7bd77]">
                          자세히 보기 →
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                </motion.div>
              )
            })}
          </section>
        )}

        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-black tracking-[3px] text-[#c4a35a]">
                SPURS SCOUT BLOG
              </p>

              <h2 className="text-3xl font-black text-white">최신 분석 글</h2>
            </div>

            <Link
              href="/blog"
              className="text-sm font-bold text-[#c4a35a] hover:underline"
            >
              전체 보기 →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-3xl border border-[#26314f] bg-[#11162a] p-6 no-underline transition hover:border-[#c4a35a]"
              >
                <p className="mb-3 text-sm font-bold text-[#c4a35a]">
                  {post.category}
                </p>

                <h3 className="mb-3 text-2xl font-black text-white">
                  {post.title}
                </h3>

                <p className="mb-4 leading-7 text-[#a8b0c2]">{post.excerpt}</p>

                <p className="text-sm text-[#777]">{post.date}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-[#26314f] bg-[#11162a] p-8">
          <p className="mb-2 text-sm font-black tracking-[3px] text-[#c4a35a]">
            PLAYER COMPARISON
          </p>

          <h2 className="mb-4 text-3xl font-black text-white">
            이적 후보 비교 분석
          </h2>

          <p className="mb-6 max-w-3xl leading-8 text-[#a8b0c2]">
            토트넘 이적 후보들을 전술 적합도, Scout Tier, 장점과 리스크
            기준으로 비교 분석합니다.
          </p>

          <Link
            href="/compare"
            className="inline-flex rounded-2xl bg-[#c4a35a] px-6 py-3 font-black text-black no-underline transition hover:opacity-90"
          >
            Compare 페이지 이동 →
          </Link>
        </section>

        <p className="mt-9 text-[13px] text-[#777]">
          본 사이트는 팬이 제작한 비공식 분석 플랫폼입니다. Tottenham Hotspur와
          공식 제휴된 서비스가 아닙니다.
        </p>
      </div>
    </main>
  )
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#c6a96b]/25 bg-[#111827] px-3 py-1.5 text-[12px] font-bold text-[#d7bd77]">
      {children}
    </span>
  )
}