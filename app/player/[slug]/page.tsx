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

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b1020',
        color: 'white',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            marginBottom: 30,
          }}
        >
          <span
            style={{
              background:
                data.status === 'talks'
                  ? '#f59e0b'
                  : data.status === 'interest'
                  ? '#2563eb'
                  : '#64748b',

              padding: '8px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {data.status}
          </span>
        </div>

        <h1
          style={{
            fontSize: 52,
            marginBottom: 10,
          }}
        >
          {data.name}
        </h1>

        <p
          style={{
            color: '#aaa',
            fontSize: 18,
            marginBottom: 40,
          }}
        >
          {data.position} · {data.nationality}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              background: '#11162a',
              borderRadius: 18,
              padding: 24,
              border: '1px solid #26314f',
            }}
          >
            <p style={{ color: '#888', marginBottom: 10 }}>적합도</p>

            <h2
              style={{
                fontSize: 42,
                color:
                  data.fit_score >= 80
                    ? '#4ade80'
                    : data.fit_score >= 70
                    ? '#facc15'
                    : '#f87171',
              }}
            >
              {data.fit_score}
            </h2>
          </div>

          <div
            style={{
              background: '#11162a',
              borderRadius: 18,
              padding: 24,
              border: '1px solid #26314f',
            }}
          >
            <p style={{ color: '#888', marginBottom: 10 }}>신뢰도</p>

            <h2
              style={{
                fontSize: 32,
              }}
            >
              {data.trust_level}
            </h2>
          </div>

          <div
            style={{
              background: '#11162a',
              borderRadius: 18,
              padding: 24,
              border: '1px solid #26314f',
            }}
          >
            <p style={{ color: '#888', marginBottom: 10 }}>예상 이적료</p>

            <h2
              style={{
                fontSize: 32,
              }}
            >
              {data.fee}
            </h2>
          </div>
        </div>

        <div
          style={{
            background: '#11162a',
            borderRadius: 20,
            padding: 30,
            border: '1px solid #26314f',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              marginBottom: 20,
              fontSize: 28,
            }}
          >
            분석
          </h2>

          <p
            style={{
              color: '#ddd',
              lineHeight: 1.8,
              fontSize: 17,
            }}
          >
            {data.link_reason}
          </p>
        </div>

        <div
          style={{
            background: '#11162a',
            borderRadius: 20,
            padding: 30,
            border: '1px solid #26314f',
          }}
        >
          <h2
            style={{
              marginBottom: 20,
              fontSize: 28,
            }}
          >
            출처
          </h2>

          <p
            style={{
              color: '#ddd',
              fontSize: 17,
            }}
          >
            {data.source}
          </p>
        </div>

        <p
          style={{
            color: '#666',
            marginTop: 40,
            fontSize: 13,
          }}
        >
          본 사이트는 팬 제작 비공식 분석 플랫폼입니다.
        </p>
      </div>
    </main>
  )
}