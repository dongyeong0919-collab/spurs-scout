export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  content: string
}

export const posts: BlogPost[] = [
  {
    slug: 'best-left-back-for-spurs',
    title: '토트넘에 가장 잘 맞는 왼쪽 풀백 유형',
    excerpt:
      '왼쪽 풀백은 단순 수비수가 아니라 전개, 압박, 하프스페이스 지원까지 담당하는 핵심 포지션이다.',
    date: '2026-05-13',
    category: 'Tactical Analysis',
    content: `
토트넘의 왼쪽 풀백은 단순히 측면 수비만 담당하는 포지션이 아니다.

현대 축구에서 풀백은 빌드업, 전진 패스, 압박 전환, 공격 가담까지 수행해야 한다.

특히 토트넘처럼 전진성이 강한 축구를 지향하는 팀에서는
왼쪽 풀백의 활동량과 판단력이 매우 중요하다.

좋은 왼쪽 풀백은 다음 조건을 갖춰야 한다:

- 빠른 전진 속도
- 안정적인 수비 복귀
- 하프스페이스 지원 능력
- 윙어와의 연계
- 압박 상황에서의 판단력

SPURS SCOUT 기준에서 왼쪽 풀백 후보를 볼 때는
단순 이름값보다 전술 적합도를 먼저 확인해야 한다.
`,
  },

  {
    slug: 'what-is-scout-tier',
    title: 'Scout Tier란 무엇인가?',
    excerpt:
      'Spurs Scout에서 사용하는 Scout Tier 시스템과 루머 신뢰도 기준을 설명합니다.',
    category: 'Guide',
    date: '2026-05-17',
    content: `
Scout Tier는 Spurs Scout가 사용하는 자체 이적 루머 분류 시스템입니다.

단순히 “링크가 있다” 수준이 아니라:

- 출처 신뢰도
- 실제 협상 가능성
- 전술적 필요성
- 시장 상황

등을 종합적으로 반영합니다.

S Tier
가장 강한 연결 단계입니다.
신뢰도 높은 기자와 실제 협상 흐름이 동반되는 경우입니다.

A Tier
현실적인 가능성이 있는 핵심 타깃입니다.

B Tier
관심은 존재하지만 아직 초기 단계입니다.

C Tier
단순 링크 혹은 약한 루머 단계입니다.

Spurs Scout는 단순 루머 집계가 아니라,
토트넘 관점에서 현실성과 전술 적합도를 함께 분석하는 것을 목표로 합니다.
`,
  },
]