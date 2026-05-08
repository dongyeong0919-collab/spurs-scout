import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

function getScoreColor(score: number) {
  if (score >= 80) return '#4ade80'
  if (score >= 70) return '#facc15'
  return '#f87171'
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('transfer_targets_view')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#0b1020',
          color: 'white',
          padding: 40,
        }}
      >
        선수 없음
      </main>
    )
  }

  const score = data.fit_score ?? 0
  const scoreColor = getScoreColor(score)

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
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: 24,
            color: '#c6a96b',
            textDecoration: 'none',
            fontWeight: 800,
          }}
        >
          ← 메인으로 돌아가기
        </Link>

        <section
          style={{
            background: 'rgba(17, 22, 42, 0.94)',
            border: '1px solid #26314f',
            borderRadius: 30,
            padding: 32,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 26,
                  background:
                    'linear-gradient(135deg, #c6a96b 0%, #6b5a2e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 28,
                  color: '#0b1020',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                }}
              >
                {getInitials(data.name)}
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    background: getStatusColor(data.status),
                    padding: '7px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  {data.status ?? 'unknown'}
                </span>

                <h1
                  style={{
                    fontSize: 48,
                    margin: 0,
                    letterSpacing: -1,
                  }}
                >
                  {data.name}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 14,
                  }}
                >
                  <Badge>{data.position ?? '-'}</Badge>
                  <Badge>{data.nationality ?? '-'}</Badge>
                  <Badge>{data.team ?? '-'}</Badge>
                </div>
              </div>
            </div>

            <div
              style={{
                minWidth: 180,
                background: '#0b1020',
                border: '1px solid #33415f',
                borderRadius: 22,
                padding: 20,
                textAlign: 'right',
              }}
            >
              <p style={{ color: '#888', marginBottom: 8 }}>전술 적합도</p>
              <strong style={{ fontSize: 42, color: scoreColor }}>
                {score}
              </strong>
              <span style={{ color: '#aaa', fontWeight: 700 }}>/100</span>
            </div>
          </div>
        </section>

        <section
          style={{
            background: 'rgba(17, 22, 42, 0.94)',
            border: '1px solid #26314f',
            borderRadius: 24,
            padding: 28,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 24 }}>적합도 게이지</h2>
            <strong style={{ color: scoreColor }}>{score}/100</strong>
          </div>

          <div
            style={{
              height: 13,
              borderRadius: 999,
              background: '#0b1020',
              overflow: 'hidden',
              border: '1px solid #1f2942',
            }}
          >
            <div
              style={{
                width: `${score}%`,
                height: '100%',
                borderRadius: 999,
                background: scoreColor,
              }}
            />
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 24,
          }}
        >
          <InfoCard title="신뢰도" value={data.trust_level ?? '-'} />
          <InfoCard title="예상 이적료" value={data.fee ?? '-'} />
          <InfoCard title="출처" value={data.source ?? '-'} />
        </section>

        <Section title="분석">
          {data.link_reason ?? '분석 정보가 아직 없습니다.'}
        </Section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginBottom: 24,
          }}
        >
          <ListCard
            title="장점"
            items={data.pros ?? []}
            emptyText="장점 정보가 없습니다."
            accent="#4ade80"
          />

          <ListCard
            title="단점"
            items={data.cons ?? []}
            emptyText="단점 정보가 없습니다."
            accent="#f87171"
          />
        </div>

        <p style={{ color: '#777', fontSize: 13, marginTop: 36 }}>
          본 사이트는 팬 제작 비공식 분석 플랫폼입니다. Tottenham Hotspur와
          공식 제휴된 서비스가 아닙니다.
        </p>
      </div>
    </main>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '6px 11px',
        borderRadius: 999,
        background: '#0b1020',
        border: '1px solid #33415f',
        color: '#d1d5db',
        fontSize: 13,
      }}
    >
      {children}
    </span>
  )
}

function InfoCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div
      style={{
        background: 'rgba(17, 22, 42, 0.94)',
        borderRadius: 20,
        padding: 22,
        border: '1px solid #26314f',
      }}
    >
      <p style={{ color: '#888', marginBottom: 10 }}>{title}</p>
      <h2 style={{ fontSize: 26, margin: 0 }}>{value}</h2>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: 'rgba(17, 22, 42, 0.94)',
        borderRadius: 24,
        padding: 28,
        border: '1px solid #26314f',
        marginBottom: 24,
      }}
    >
      <h2 style={{ marginBottom: 18, fontSize: 26 }}>{title}</h2>
      <p style={{ color: '#ddd', lineHeight: 1.8, fontSize: 17 }}>{children}</p>
    </section>
  )
}

function ListCard({
  title,
  items,
  emptyText,
  accent,
}: {
  title: string
  items: string[]
  emptyText: string
  accent: string
}) {
  return (
    <section
      style={{
        background: 'rgba(17, 22, 42, 0.94)',
        borderRadius: 24,
        padding: 28,
        border: '1px solid #26314f',
      }}
    >
      <h2 style={{ marginBottom: 18, fontSize: 26 }}>{title}</h2>

      {items.length > 0 ? (
        <ul style={{ color: '#ddd', lineHeight: 1.9, paddingLeft: 0, listStyle: 'none' }}>
          {items.map((item, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: accent,
                  flexShrink: 0,
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#888' }}>{emptyText}</p>
      )}
    </section>
  )
}