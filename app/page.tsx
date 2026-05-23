'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import PlayerCard from '@/components/PlayerCard'
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

export default function HomePage() {
  const latestPosts = posts.slice(0, 2)

  const [targets, setTargets] = useState<Target[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'home' | 'transfer' | 'news'>('home')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
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

    if (status !== 'all') {
      result = result.filter((player) => player.status === status)
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

    if (sort === 'latest') {
      result.sort((a, b) =>
        (b.rumor_date ?? '').localeCompare(a.rumor_date ?? '')
      )
    }

    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [targets, search, status, position, sort, favoriteOnly, favorites])

  function resetFilters() {
    setSearch('')
    setStatus('all')
    setPosition('all')
    setSort('fit')
    setFavoriteOnly(false)
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#0b1020] pb-24 shadow-2xl lg:max-w-[1220px] lg:bg-transparent lg:px-6 lg:py-8">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/95 px-5 py-4 backdrop-blur lg:rounded-3xl lg:border lg:border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-2xl font-black text-white transition hover:border-white/30 hover:bg-white hover:text-[#050816]"
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
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-white no-underline transition hover:border-white hover:bg-white hover:text-[#050816]"
            >
              Admin
            </Link>
          </div>
        </header>

        <section className="px-5 pt-7 text-center lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_center,#1e2a4a_0%,#10182f_45%,#060914_100%)] px-5 py-11 shadow-[0_0_90px_rgba(255,255,255,0.10)] sm:py-12"
          >
            <div className="absolute inset-0 opacity-25">
              <div className="absolute left-[8%] top-[24%] h-[150px] w-[84%] rounded-t-full border-t border-white/25" />
              <div className="absolute left-[16%] top-[32%] h-[120px] w-[68%] rounded-t-full border-t border-white/10" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(to_top,rgba(255,255,255,0.10),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-7 flex h-[170px] w-[170px] items-center justify-center rounded-full border border-white/70 bg-white p-4 shadow-[0_0_50px_rgba(255,255,255,0.22)]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
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

              <p className="mb-4 text-xs font-black tracking-[5px] text-white/90">
                TOTTENHAM TRANSFER HUB
              </p>

              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                SPURS
                <br />
                SCOUT
              </h1>

              <p className="mx-auto mt-7 max-w-[360px] text-sm leading-7 text-white/80">
                토트넘 이적 루머를 전술 적합도, 출처 신뢰도, 이적 가능성으로 분석합니다.
              </p>
            </div>
          </motion.div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('transfer')}
              className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                activeTab === 'transfer'
                  ? 'bg-white text-[#050816]'
                  : 'border border-white/10 bg-white/[0.03] text-white hover:border-white/30'
              }`}
            >
              이적시장
            </button>

            <Link
              href="/compare"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-black text-white no-underline transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              비교
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                activeTab === 'news'
                  ? 'bg-white text-[#050816]'
                  : 'border border-white/10 bg-white/[0.03] text-white hover:border-white/30'
              }`}
            >
              뉴스
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-center">
            <p className="text-xs font-bold tracking-[2px] text-white/45">
              AD / NOTICE
            </p>
            <p className="mt-1 text-xl font-black text-white">광고 영역</p>
          </div>
        </section>

        {activeTab === 'transfer' && (
          <>
            <section className="px-5 pt-6">
              <div className="rounded-[26px] border border-white/10 bg-[#0b1020] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-black tracking-[2px] text-white/45">
                      FILTER
                    </p>
                    <h2 className="mt-1 text-xl font-black text-white">
                      선수 검색
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/30 hover:text-white"
                  >
                    초기화
                  </button>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="선수 이름 / 팀 / 출처 검색"
                  className="mb-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-[#11162a] px-3 py-3 text-sm text-white outline-none transition focus:border-white/40"
                  >
                    <option value="all">전체 상태</option>
                    <option value="linked">linked</option>
                    <option value="interest">interest</option>
                    <option value="talks">talks</option>
                    <option value="verbal">verbal</option>
                    <option value="official">official</option>
                  </select>

                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-[#11162a] px-3 py-3 text-sm text-white outline-none transition focus:border-white/40"
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
                    className="rounded-2xl border border-white/10 bg-[#11162a] px-3 py-3 text-sm text-white outline-none transition focus:border-white/40"
                  >
                    <option value="fit">적합도순</option>
                    <option value="latest">최신순</option>
                    <option value="name">이름순</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setFavoriteOnly(!favoriteOnly)}
                    className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${
                      favoriteOnly
                        ? 'bg-white text-[#050816]'
                        : 'border border-white/10 bg-[#11162a] text-white hover:border-white/30'
                    }`}
                  >
                    ⭐ 관심 선수
                  </button>
                </div>
              </div>
            </section>

            <section className="px-5 pt-7">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black tracking-[2px] text-white/45">
                    TRANSFER MARKET
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    이적 후보
                  </h2>
                </div>

                <p className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/60">
                  {filteredTargets.length}/{targets.length}
                </p>
              </div>

              {filteredTargets.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/70">
                  선택한 조건에 맞는 이적 후보가 없습니다.
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  {filteredTargets.map((player, index) => (
                    <PlayerCard
                      key={player.case_id}
                      player={player}
                      index={index}
                      isFavorite={favorites.includes(player.slug)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'news' && (
          <section className="px-5 pt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black tracking-[2px] text-white/45">
                  BLOG
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  최신 뉴스
                </h2>
              </div>

              <Link
                href="/blog"
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70 no-underline transition hover:border-white/30 hover:text-white"
              >
                전체 보기 →
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-[24px] border border-white/10 bg-[#0b1020] p-5 no-underline transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.035]"
                >
                  <p className="mb-2 text-xs font-black tracking-[2px] text-white/45">
                    {post.category}
                  </p>

                  <h3 className="mb-2 text-xl font-black leading-7 text-white">
                    {post.title}
                  </h3>

                  <p className="line-clamp-2 text-sm leading-6 text-white/65">
                    {post.excerpt}
                  </p>

                  <p className="mt-4 text-xs font-black text-white">
                    읽기 →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="px-5 pt-10">
          <div className="rounded-[24px] border border-white/10 bg-[#0b1020] p-5">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="text-sm font-bold text-white/75 no-underline transition hover:text-white"
              >
                개인정보처리방침
              </Link>

              <Link
                href="/admin"
                prefetch={false}
                className="text-sm font-bold text-white/75 no-underline transition hover:text-white"
              >
                관리자
              </Link>
            </div>

            <p className="mt-4 text-xs leading-6 text-white/35">
              본 사이트는 팬이 제작한 비공식 분석 플랫폼입니다. Tottenham Hotspur와
              공식 제휴된 서비스가 아닙니다.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}