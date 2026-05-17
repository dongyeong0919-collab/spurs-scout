'use client'

import Image from 'next/image'
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

const positionOptions = ['GK', 'LB', 'RB', 'CB', 'DM', 'CM', 'AMF', 'LW', 'RW', 'ST']

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

export default function HomePage() {
  const latestPosts = posts.slice(0, 2)

  const [targets, setTargets] = useState<Target[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'home' | 'transfer' | 'news'>('home')

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
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  function toggleFavorite(slug: string) {
    const updated = favorites.includes(slug)
      ? favorites.filter((item) => item !== slug)
      : [...favorites, slug]

    setFavorites(updated)
    localStorage.setItem('spurs-scout-favorites', JSON.stringify(updated))
  }

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

    if (status !== 'all') result = result.filter((player) => player.status === status)
    if (tier !== 'all') result = result.filter((player) => player.scout_tier === tier)
    if (position !== 'all') result = result.filter((player) => player.position === position)
    if (favoriteOnly) result = result.filter((player) => favorites.includes(player.slug))

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
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[430px] bg-[#0b1020] pb-24 shadow-2xl lg:max-w-[1220px] lg:bg-transparent lg:px-6 lg:py-8">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/95 px-5 py-4 backdrop-blur lg:rounded-3xl lg:border lg:border-[#26314f]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-2xl font-black text-white"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-lg font-black tracking-wide text-white"
            >
              SPURS SCOUT
            </button>

            <Link
              href="/admin"
              prefetch={false}
              className="rounded-full border border-[#c6a96b]/40 px-3 py-1.5 text-xs font-bold text-[#c6a96b] no-underline"
            >
              Admin
            </Link>
          </div>
        </header>

        <section className="px-5 pt-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_center,#1e2a4a_0%,#10182f_45%,#060914_100%)] px-5 py-12 shadow-[0_0_90px_rgba(198,169,107,0.12)]"
          >
            <div className="absolute inset-0 opacity-25">
              <div className="absolute left-[8%] top-[24%] h-[150px] w-[84%] rounded-t-full border-t border-[#c6a96b]/25" />
              <div className="absolute left-[16%] top-[32%] h-[120px] w-[68%] rounded-t-full border-t border-white/10" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(to_top,rgba(198,169,107,0.10),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-7 flex h-[170px] w-[170px] items-center justify-center rounded-full border border-[#e5e7eb]/70 bg-[radial-gradient(circle,#f8fafc_0%,#e5e7eb_55%,#c6a96b_100%)] p-4 shadow-[0_0_50px_rgba(255,255,255,0.20)]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f8fafc]">
                  <Image
                    src="/spurs-scout-logo.png"
                    alt="SPURS SCOUT logo"
                    width={125}
                    height={125}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <p className="mb-4 text-xs font-black tracking-[5px] text-[#c6a96b]">
                TOTTENHAM TRANSFER HUB
              </p>

              <h1 className="bg-[linear-gradient(180deg,#ffffff_0%,#d7dbe7_45%,#8f96aa_100%)] bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
                SPURS
                <br />
                SCOUT
              </h1>

              <div className="mt-8 grid w-full max-w-[420px] grid-cols-3 gap-3">
                <FeatureIcon icon="▦" label="전술 적합도" />
                <FeatureIcon icon="⌕" label="Scout Tier" />
                <FeatureIcon icon="%" label="이적 가능성 분석" />
              </div>

              <div className="my-7 h-[1px] w-full max-w-[360px] bg-[#c6a96b]/50" />

              <p className="mx-auto max-w-[360px] text-sm leading-7 text-[#f1f5f9]">
                토트넘 이적 루머를 전술 적합도, Scout Tier, 이적 가능성으로 분석합니다.
              </p>
            </div>
          </motion.div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('transfer')}
              className={`rounded-2xl px-3 py-3 text-sm font-black ${
                activeTab === 'transfer'
                  ? 'bg-[#c6a96b] text-[#0b1020]'
                  : 'border border-[#33415f] bg-[#0b1020] text-white'
              }`}
            >
              이적시장
            </button>

            <Link
              href="/compare"
              className="rounded-2xl border border-[#33415f] bg-[#0b1020] px-3 py-3 text-sm font-black text-white no-underline"
            >
              비교
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`rounded-2xl px-3 py-3 text-sm font-black ${
                activeTab === 'news'
                  ? 'bg-[#c6a96b] text-[#0b1020]'
                  : 'border border-[#33415f] bg-[#0b1020] text-white'
              }`}
            >
              뉴스
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-[#c6a96b]/25 bg-[#2a2f42] px-5 py-5 text-center">
            <p className="text-xs font-bold text-[#a8b0c2]">AD / NOTICE</p>
            <p className="mt-1 text-xl font-black text-white">광고 영역</p>
          </div>
        </section>

        {activeTab === 'home' && null}

        {activeTab === 'transfer' && (
          <>
            <section className="px-5 pt-6">
              <div className="rounded-[26px] border border-[#26314f] bg-[#0b1020] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black tracking-[2px] text-[#c6a96b]">
                      LIVE TRANSFER FEED
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-white">
                      최근 업데이트
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#22c55e]/40 bg-[#052e16] px-3 py-1 text-xs font-black text-[#86efac]">
                    LIVE
                  </span>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <UpdateItem
                    player="Eberechi Eze"
                    tag="Probability"
                    text="이적 가능성이 68%로 업데이트되었습니다."
                    time="방금 전"
                  />

                  <UpdateItem
                    player="Marc Guehi"
                    tag="Source"
                    text="BBC Sport 기반 루머 출처가 반영되었습니다."
                    time="12분 전"
                  />

                  <UpdateItem
                    player="Pedro Neto"
                    tag="Status"
                    text="윙어 보강 후보로 talks 상태를 유지 중입니다."
                    time="오늘"
                  />
                </div>
              </div>
            </section>

            <section className="px-5 pt-6">
              <div className="rounded-[26px] border border-[#26314f] bg-[#0b1020] p-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="선수 이름 / 팀 / 출처 검색"
                  className="mb-3 w-full rounded-2xl border border-[#33415f] bg-[#11162a] px-4 py-3 text-sm text-white outline-none focus:border-[#c6a96b]"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-2xl border border-[#33415f] bg-[#11162a] px-3 py-3 text-sm text-white"
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
                    className="rounded-2xl border border-[#33415f] bg-[#11162a] px-3 py-3 text-sm text-white"
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
                    className="rounded-2xl border border-[#33415f] bg-[#11162a] px-3 py-3 text-sm text-white"
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
                    className="rounded-2xl border border-[#33415f] bg-[#11162a] px-3 py-3 text-sm text-white"
                  >
                    <option value="fit">적합도순</option>
                    <option value="tier">티어순</option>
                    <option value="name">이름순</option>
                  </select>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setFavoriteOnly(!favoriteOnly)}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      favoriteOnly
                        ? 'bg-[#c6a96b] text-[#0b1020]'
                        : 'border border-[#33415f] text-white'
                    }`}
                  >
                    ⭐ 관심 선수
                  </button>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#c6a96b]"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </section>

            <section className="px-5 pt-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black tracking-[2px] text-[#c6a96b]">
                    TRANSFER MARKET
                  </p>
                  <h2 className="text-2xl font-black">이적 후보</h2>
                </div>

                <p className="text-xs text-[#a8b0c2]">
                  {filteredTargets.length}/{targets.length}
                </p>
              </div>

              {filteredTargets.length === 0 ? (
                <p className="rounded-2xl border border-[#26314f] bg-[#0b1020] p-5 text-sm text-[#a8b0c2]">
                  선택한 포지션의 이적 소식이 아직 없습니다.
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  {filteredTargets.map((player, index) => {
                    const score = player.fit_score ?? 0
                    const probability = Math.min(
                      Math.max(player.transfer_probability ?? 0, 0),
                      100
                    )
                    const scoreColor = getScoreColor(score)
                    const probabilityColor = getProbabilityColor(probability)
                    const tierColor = getTierColor(player.scout_tier)
                    const isFavorite = favorites.includes(player.slug)

                    return (
                      <motion.article
                        key={player.case_id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: index * 0.05,
                        }}
                        className="relative rounded-[26px] border border-[#26314f] bg-[#0b1020] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c6a96b]/50 hover:shadow-[0_0_30px_rgba(198,169,107,0.18)]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFavorite(player.slug)}
                          className="absolute right-4 top-4 rounded-full border border-[#c6a96b]/30 bg-[#11162a] px-3 py-2 text-lg"
                        >
                          {isFavorite ? '⭐' : '☆'}
                        </button>

                        <Link
                          href={`/player/${player.slug}`}
                          className="text-white no-underline"
                        >
                          <div className="flex gap-4 pr-12">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c6a96b] text-lg font-black text-[#0b1020]">
                              {getInitials(player.name)}
                            </div>

                            <div>
                              <h3 className="text-xl font-black">{player.name}</h3>

                              <div className="mt-1 flex items-center gap-2 text-sm text-[#a8b0c2]">
                                <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-[#c6a96b]/30 bg-[#11162a] px-2 text-[10px] font-black text-[#c6a96b]">
                                  {getTeamInitials(player.current_team)}
                                </span>

                                <span>
                                  {player.position ?? '-'} · {player.current_team ?? '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-black text-[#0b1020]"
                              style={{ background: tierColor }}
                            >
                              {player.scout_tier ?? '-'} TIER
                            </span>

                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-black uppercase text-white"
                              style={{ background: getStatusColor(player.status) }}
                            >
                              {player.status ?? 'unknown'}
                            </span>
                          </div>

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

                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#d1d5db]">
                            {player.conclusion ??
                              '아직 한줄 결론이 입력되지 않았습니다.'}
                          </p>

                          <div className="mt-4 flex items-center justify-between border-t border-[#26314f] pt-4">
                            <span className="text-xs text-[#94a3b8]">
                              {player.source ?? '출처 준비 중'}
                            </span>
                            <span className="rounded-full bg-[#c6a96b] px-3 py-2 text-xs font-black text-[#0b1020] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_18px_rgba(198,169,107,0.35)]">
                              자세히 보기 →
                            </span>
                          </div>
                        </Link>
                      </motion.article>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'news' && (
          <section className="px-5 pt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">최신 뉴스</h2>
              <Link href="/blog" className="text-sm font-bold text-[#c6a96b]">
                전체 보기 →
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-[24px] border border-[#26314f] bg-[#0b1020] p-5 no-underline"
                >
                  <p className="mb-2 text-xs font-bold text-[#c6a96b]">
                    {post.category}
                  </p>
                  <h3 className="mb-2 text-xl font-black text-white">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-6 text-[#a8b0c2]">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="px-5 pt-10">
          <div className="rounded-[24px] border border-[#26314f] bg-[#0b1020] p-5">
            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="text-sm font-bold text-[#c6a96b]">
                개인정보처리방침
              </Link>
              <Link
                href="/admin"
                prefetch={false}
                className="text-sm font-bold text-[#c6a96b]"
              >
                관리자
              </Link>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#777]">
              본 사이트는 팬이 제작한 비공식 분석 플랫폼입니다. Tottenham Hotspur와
              공식 제휴된 서비스가 아닙니다.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}

function FeatureIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c6a96b]/40 bg-[#0b1020]/70 text-xl font-black text-[#c6a96b]">
        {icon}
      </div>
      <p className="text-center text-[11px] font-bold leading-4 text-white">
        {label}
      </p>
    </div>
  )
}

function UpdateItem({
  player,
  tag,
  text,
  time,
}: {
  player: string
  tag: string
  text: string
  time: string
}) {
  return (
    <div className="rounded-2xl border border-[#1d2745] bg-[#11162a] p-4 transition-all duration-300 hover:border-[#c6a96b]/40 hover:shadow-[0_0_22px_rgba(198,169,107,0.12)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-black text-white">{player}</p>

        <span className="rounded-full bg-[#c6a96b] px-2.5 py-1 text-[10px] font-black text-[#0b1020]">
          {tag}
        </span>
      </div>

      <p className="text-sm leading-6 text-[#a8b0c2]">{text}</p>

      <p className="mt-2 text-xs font-bold text-[#c6a96b]">{time}</p>
    </div>
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
    <div className="mt-3 rounded-2xl border border-[#26314f] bg-[#11162a] p-4 transition-all duration-300 hover:border-[#c6a96b]/40 hover:shadow-[0_0_24px_rgba(198,169,107,0.12)]">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-[#a8b0c2]">{label}</span>
        <strong style={{ color }}>{value}</strong>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#0b1020]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safePercent}%` }}
          transition={{
            duration: 0.9,
            ease: 'easeOut',
          }}
          className="h-full rounded-full shadow-[0_0_14px_rgba(255,255,255,0.16)]"
          style={{
            background: color,
          }}
        />
      </div>
    </div>
  )
}