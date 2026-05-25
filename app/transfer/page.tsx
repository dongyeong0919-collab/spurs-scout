'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import BackButton from '@/components/BackButton'
import PlayerCard from '@/components/PlayerCard'

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

const positionOptions = [
  'GK',
  'LB',
  'RB',
  'CB',
  'DM',
  'CM',
  'AMF',
  'LW',
  'RW',
  'ST',
]

export default function TransferPage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

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

    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }, [])

  function toggleFavorite(slug: string) {
    const updated = favorites.includes(slug)
      ? favorites.filter((item) => item !== slug)
      : [...favorites, slug]

    setFavorites(updated)
    localStorage.setItem(
      'spurs-scout-favorites',
      JSON.stringify(updated)
    )
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
      result = result.filter(
        (player) => player.status === status
      )
    }

    if (position !== 'all') {
      result = result.filter(
        (player) => player.position === position
      )
    }

    if (favoriteOnly) {
      result = result.filter((player) =>
        favorites.includes(player.slug)
      )
    }

    if (sort === 'fit') {
      result.sort(
        (a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0)
      )
    }

    if (sort === 'latest') {
      result.sort((a, b) =>
        (b.rumor_date ?? '').localeCompare(
          a.rumor_date ?? ''
        )
      )
    }

    if (sort === 'name') {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    }

    return result
  }, [
    targets,
    search,
    status,
    position,
    sort,
    favoriteOnly,
    favorites,
  ])

  function resetFilters() {
    setSearch('')
    setStatus('all')
    setPosition('all')
    setSort('fit')
    setFavoriteOnly(false)
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f5f7fb_0%,#edf2f7_50%,#f8fafc_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-[1180px]">
        <BackButton />

        <section className="mb-8">
          <p className="mb-2 text-xs font-black tracking-[3px] text-[#5B6CB8]">
            TRANSFER MARKET
          </p>

          <h1 className="text-4xl font-black tracking-tight text-[#0b1020] sm:text-5xl">
            이적시장
          </h1>

          <p className="mt-4 max-w-2xl leading-8 text-[#5f657a]">
            토트넘 이적 후보를 검색하고,
            전술 적합도와 이적 가능성을 기준으로
            비교해볼 수 있습니다.
          </p>
        </section>

        <section className="mb-8 rounded-[34px] bg-[#060B23] p-6 shadow-[0_25px_80px_rgba(3,8,28,0.35)] sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[2px] text-[#8FB8FF]">
                FILTER
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                선수 검색
              </h2>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#1E2A6D] bg-[#111936] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1E2A6D]"
            >
              초기화
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="선수 이름 / 팀 / 출처 검색"
            className="mb-4 w-full rounded-2xl border border-[#1E2A6D] bg-[#0D1430] px-4 py-4 text-sm text-white outline-none transition placeholder:text-[#8A90A7] focus:border-[#7FA7FF]"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-[#1E2A6D] bg-[#0D1430] px-4 py-4 text-sm text-white outline-none transition focus:border-[#7FA7FF]"
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
              className="rounded-2xl border border-[#1E2A6D] bg-[#0D1430] px-4 py-4 text-sm text-white outline-none transition focus:border-[#7FA7FF]"
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
              className="rounded-2xl border border-[#1E2A6D] bg-[#0D1430] px-4 py-4 text-sm text-white outline-none transition focus:border-[#7FA7FF]"
            >
              <option value="fit">적합도순</option>
              <option value="latest">최신순</option>
              <option value="name">이름순</option>
            </select>

            <button
              type="button"
              onClick={() =>
                setFavoriteOnly(!favoriteOnly)
              }
              className={`rounded-2xl px-4 py-4 text-sm font-black transition ${
                favoriteOnly
                  ? 'bg-[#4D73FF] text-white'
                  : 'border border-[#1E2A6D] bg-[#0D1430] text-white hover:bg-[#16214A]'
              }`}
            >
              ⭐ 관심 선수
            </button>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[2px] text-[#5B6CB8]">
                TARGET LIST
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#0b1020]">
                이적 후보
              </h2>
            </div>

            <p className="rounded-full bg-[#060B23] px-4 py-2 text-xs font-bold text-white shadow-[0_10px_30px_rgba(11,16,32,0.18)]">
              {filteredTargets.length}/{targets.length}
            </p>
          </div>

          {filteredTargets.length === 0 ? (
            <p className="rounded-3xl bg-[#060B23] p-6 text-sm leading-7 text-white/70 shadow-[0_18px_55px_rgba(11,16,32,0.18)]">
              선택한 조건에 맞는 이적 후보가 없습니다.
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {filteredTargets.map((player, index) => (
                <PlayerCard
                  key={player.case_id}
                  player={player}
                  index={index}
                  isFavorite={favorites.includes(
                    player.slug
                  )}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 flex justify-center">
          <Link
            href="/compare"
            className="rounded-full border border-[#2B3F8F] bg-[#1E2A6D] px-8 py-4 text-base font-black text-white no-underline shadow-[0_18px_45px_rgba(12,20,55,0.45)] transition hover:bg-[#2B3F8F] hover:text-white"
          >
            후보 비교하러 가기 →
          </Link>
        </div>
      </div>
    </main>
  )
}