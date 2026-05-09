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
  name: string
  slug: string
  nationality: string | null
  position: string | null
  status: string | null
  trust_level: string | null
  fit_score: number | null
  fee: string | null
  current_team: string | null
  scout_tier: string | null
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
  if (tier === 'C') return '#94a3b8'
  return '#64748b'
}

export default function HomePage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('fit')

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

  const filteredTargets = useMemo(() => {
    let result = [...targets]

    if (search.trim()) {
      result = result.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status !== 'all') {
      result = result.filter((player) => player.status === status)
    }

    if (sort === 'fit') {
      result.sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0))
    }

    if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sort === 'tier') {
      const order: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 }
      result.sort(
        (a, b) =>
          (order[b.scout_tier ?? ''] ?? 0) -
          (order[a.scout_tier ?? ''] ?? 0)
      )
    }

    return result
  }, [targets, search, status, sort])

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #17213a 0%, #0b1020 45%, #050816 100%)',
        color: 'white',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 34 }}>
          <p
            style={{
              color: '#c6a96b',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 3,
              marginBottom: 10,
            }}
          >
            TRANSFER INTELLIGENCE
          </p>

          <h1
            style={{
              fontSize: 46,
              fontWeight: 900,
              marginBottom: 12,
              color: '#ffffff',
              letterSpacing: 1,
            }}
          >
            SPURS SCOUT
          </h1>

          <p style={{ color: '#a8b0c2', maxWidth: 620, lineHeight: 1.7 }}>
            Tottenham 팬들을 위한 비공식 이적 분석 플랫폼입니다. 선수 사진과
            구단 로고 없이 자체 분석 데이터와 안전한 UI 요소만 사용합니다.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 32,
            padding: 16,
            borderRadius: 20,
            background: 'rgba(17, 22, 42, 0.75)',
            border: '1px solid #26314f',
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="선수 이름 검색"
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #33415f',
              background: '#0b1020',
              color: 'white',
              minWidth: 220,
              outline: 'none',
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #33415f',
              background: '#0b1020',
              color: 'white',
            }}
          >
            <option value="all">전체 상태</option>
            <option value="linked">linked</option>
            <option value="interest">interest</option>
            <option value="talks">talks</option>
            <option value="verbal">verbal</option>
            <option value="official">official</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #33415f',
              background: '#0b1020',
              color: 'white',
            }}
          >
            <option value="fit">적합도 높은 순</option>
            <option value="tier">Scout 티어 높은 순</option>
            <option value="name">이름순</option>
          </select>
        </div>

        {filteredTargets.length === 0 ? (
          <p style={{ color: '#aaa' }}>조건에 맞는 선수가 없습니다.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {filteredTargets.map((player) => {
              const score = player.fit_score ?? 0
              const tierColor = getTierColor(player.scout_tier)

              return (
                <Link
                  key={player.case_id}
                  href={`/player/${player.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                  }}
                >
                  <article
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.borderColor = '#c6a96b'
                      e.currentTarget.style.boxShadow =
                        '0 18px 40px rgba(0,0,0,0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)'
                      e.currentTarget.style.borderColor = '#26314f'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    style={{
                      background: 'rgba(17, 22, 42, 0.92)',
                      border: '1px solid #26314f',
                      borderRadius: 24,
                      padding: 24,
                      minHeight: 310,
                      transition: 'all 0.22s ease',
                      cursor: 'pointer',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 22,
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 18,
                          background:
                            'linear-gradient(135deg, #c6a96b 0%, #6b5a2e 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 20,
                          color: '#0b1020',
                        }}
                      >
                        {getInitials(player.name)}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <span
                          style={{
                            background: tierColor,
                            color: '#0b1020',
                            padding: '6px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          {player.scout_tier ?? '-'} TIER
                        </span>

                        <span
                          style={{
                            background: getStatusColor(player.status),
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {player.status ?? 'unknown'}
                        </span>
                      </div>
                    </div>

                    <h2 style={{ fontSize: 26, marginBottom: 8 }}>
                      {player.name}
                    </h2>

                    <p
                      style={{
                        color: '#c6a96b',
                        marginBottom: 14,
                        fontWeight: 700,
                      }}
                    >
                      현재 소속팀: {player.current_team ?? '-'}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 18,
                      }}
                    >
                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: 999,
                          background: '#0b1020',
                          border: '1px solid #33415f',
                          color: '#d1d5db',
                          fontSize: 13,
                        }}
                      >
                        {player.position ?? '-'}
                      </span>

                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: 999,
                          background: '#0b1020',
                          border: '1px solid #33415f',
                          color: '#d1d5db',
                          fontSize: 13,
                        }}
                      >
                        {player.nationality ?? '-'}
                      </span>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                          color: '#a8b0c2',
                          fontSize: 14,
                        }}
                      >
                        <span>전술 적합도</span>
                        <strong
                          style={{
                            color:
                              score >= 80
                                ? '#4ade80'
                                : score >= 70
                                ? '#facc15'
                                : '#f87171',
                          }}
                        >
                          {score}/100
                        </strong>
                      </div>

                      <div
                        style={{
                          height: 9,
                          borderRadius: 999,
                          background: '#0b1020',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${score}%`,
                            height: '100%',
                            borderRadius: 999,
                            background:
                              score >= 80
                                ? '#4ade80'
                                : score >= 70
                                ? '#facc15'
                                : '#f87171',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ color: '#d1d5db', lineHeight: 1.8 }}>
                      <p>신뢰도: {player.trust_level ?? '-'}</p>
                      <p>예상 이적료: {player.fee ?? '-'}</p>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}

        <p style={{ color: '#777', fontSize: 13, marginTop: 36 }}>
          본 사이트는 팬이 제작한 비공식 분석 플랫폼입니다. Tottenham
          Hotspur와 공식 제휴된 서비스가 아닙니다.
        </p>
      </div>
    </main>
  )
}