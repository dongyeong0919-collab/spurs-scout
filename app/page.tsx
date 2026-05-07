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

    return result
  }, [targets, search, status, sort])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b1020',
        color: 'white',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 12,
            color: '#c6a96b',
            letterSpacing: 2,
          }}
        >
          SPURS SCOUT
        </h1>

        <p style={{ color: '#aaa', marginBottom: 24 }}>
          Tottenham 팬들을 위한 비공식 이적 분석 플랫폼
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 32,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="선수 이름 검색"
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #26314f',
              background: '#11162a',
              color: 'white',
              minWidth: 220,
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #26314f',
              background: '#11162a',
              color: 'white',
            }}
          >
            <option value="all">전체 상태</option>
            <option value="talks">talks</option>
            <option value="interest">interest</option>
            <option value="linked">linked</option>
            <option value="verbal">verbal</option>
            <option value="official">official</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #26314f',
              background: '#11162a',
              color: 'white',
            }}
          >
            <option value="fit">적합도 높은 순</option>
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
            {filteredTargets.map((player) => (
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
    e.currentTarget.style.transform = 'translateY(-4px)'
    e.currentTarget.style.borderColor = '#c6a96b'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0px)'
    e.currentTarget.style.borderColor = '#26314f'
  }}
  style={{
    background: '#11162a',
    border: '1px solid #26314f',
    borderRadius: 20,
    padding: 24,
    minHeight: 230,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    height: '100%',
  }}
>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <span
                      style={{
                        background:
                          player.status === 'talks'
                            ? '#f59e0b'
                            : player.status === 'interest'
                            ? '#2563eb'
                            : player.status === 'linked'
                            ? '#64748b'
                            : player.status === 'verbal'
                            ? '#7c3aed'
                            : player.status === 'official'
                            ? '#16a34a'
                            : '#444',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {player.status ?? 'unknown'}
                    </span>

                    <span
                      style={{
                        color:
                          (player.fit_score ?? 0) >= 80
                            ? '#4ade80'
                            : (player.fit_score ?? 0) >= 70
                            ? '#facc15'
                            : '#f87171',
                        fontWeight: 800,
                        fontSize: 22,
                      }}
                    >
                      {player.fit_score ?? '-'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: 26, marginBottom: 10 }}>
                    {player.name}
                  </h2>

                  <p style={{ color: '#bbb', marginBottom: 18 }}>
                    {player.position} · {player.nationality}
                  </p>

                  <div style={{ color: '#d1d5db', lineHeight: 1.8 }}>
                    <p>신뢰도: {player.trust_level ?? '-'}</p>
                    <p>예상 이적료: {player.fee ?? '-'}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        <p style={{ color: '#777', fontSize: 13, marginTop: 36 }}>
          본 사이트는 팬이 제작한 비공식 분석 플랫폼입니다. Tottenham Hotspur와 공식 제휴된 서비스가 아닙니다.
        </p>
      </div>
    </main>
  )
}