import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      <main style={{ minHeight: '100vh', background: '#0b1020', color: 'white', padding: 40 }}>
        선수 없음
      </main>
    )
  }

  const fitScore = data.fit_score ?? 0

  return (
    <main style={{ minHeight: '100vh', background: '#0b1020', color: 'white', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <span
          style={{
            background: data.status === 'talks' ? '#f59e0b' : data.status === 'interest' ? '#2563eb' : '#64748b',
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {data.status ?? 'unknown'}
        </span>

        <h1 style={{ fontSize: 52, marginTop: 36, marginBottom: 10 }}>{data.name}</h1>

        <p style={{ color: '#aaa', fontSize: 18, marginBottom: 40 }}>
          {data.position} · {data.nationality}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
          <InfoCard title="적합도" value={fitScore} highlight />
          <InfoCard title="신뢰도" value={data.trust_level ?? '-'} />
          <InfoCard title="예상 이적료" value={data.fee ?? '-'} />
        </div>

        <Section title="분석">
          {data.link_reason ?? '분석 정보가 아직 없습니다.'}
        </Section>

        <Section title="출처">
          {data.source ?? '출처 정보가 아직 없습니다.'}
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 24 }}>
          <ListCard title="장점" items={data.pros ?? []} emptyText="장점 정보가 없습니다." />
          <ListCard title="단점" items={data.cons ?? []} emptyText="단점 정보가 없습니다." />
        </div>

        <p style={{ color: '#666', marginTop: 40, fontSize: 13 }}>
          본 사이트는 팬 제작 비공식 분석 플랫폼입니다.
        </p>
      </div>
    </main>
  )
}

function InfoCard({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div
      style={{
        background: '#11162a',
        borderRadius: 18,
        padding: 24,
        border: '1px solid #26314f',
      }}
    >
      <p style={{ color: '#888', marginBottom: 10 }}>{title}</p>
      <h2
        style={{
          fontSize: highlight ? 42 : 32,
          color: highlight ? '#4ade80' : 'white',
          margin: 0,
        }}
      >
        {value}
      </h2>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#11162a',
        borderRadius: 20,
        padding: 30,
        border: '1px solid #26314f',
        marginBottom: 24,
      }}
    >
      <h2 style={{ marginBottom: 20, fontSize: 28 }}>{title}</h2>
      <p style={{ color: '#ddd', lineHeight: 1.8, fontSize: 17 }}>{children}</p>
    </div>
  )
}

function ListCard({
  title,
  items,
  emptyText,
}: {
  title: string
  items: string[]
  emptyText: string
}) {
  return (
    <div
      style={{
        background: '#11162a',
        borderRadius: 20,
        padding: 30,
        border: '1px solid #26314f',
      }}
    >
      <h2 style={{ marginBottom: 20, fontSize: 28 }}>{title}</h2>

      {items.length > 0 ? (
        <ul style={{ color: '#ddd', lineHeight: 1.9, paddingLeft: 20 }}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#888' }}>{emptyText}</p>
      )}
    </div>
  )
}