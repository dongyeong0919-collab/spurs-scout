export default function ComparePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          padding: 32,
          border: '1px solid #ddd',
          borderRadius: 20,
          textAlign: 'center',
          background: '#fff',
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>
          후보 비교 기능 준비 중
        </h1>

        <p
          style={{
            color: '#666',
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          더 정확한 전술 비교와 선수 분석 기능을 위해 현재 개선 작업 중입니다.
          곧 업데이트될 예정입니다.
        </p>

        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 18px',
            borderRadius: 12,
            background: '#111',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          메인으로 돌아가기
        </a>
      </div>
    </main>
  )
}