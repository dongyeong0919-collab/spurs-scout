export type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt: string
  date: string
  category: string
  content: string
}

export const posts: BlogPost[] = [
  {
    slug: 'tottenham-striker-targets-2026',
    title: '토트넘 스트라이커 영입 후보 TOP5',
    description:
      '토트넘의 차기 스트라이커 후보들을 전술 적합도와 현실 가능성 기준으로 분석합니다.',
    excerpt:
      '토트넘의 차기 스트라이커 후보들을 전술 적합도와 현실 가능성 기준으로 분석합니다.',
    date: '2026-05-13',
    category: 'Transfer Analysis',
    content: `
토트넘은 현재 새로운 스트라이커 보강 가능성을 검토하고 있다.

후보로는 다음 선수들이 거론된다:

- Jonathan David
- Viktor Gyokeres
- Benjamin Sesko
- Santiago Gimenez
- Ivan Toney

SPURS SCOUT 기준에서는
전술 적합도와 현실 가능성을 함께 고려해야 한다.

특히 압박 강도와 침투 움직임은
포스테코글루 시스템에서 매우 중요하다.
    `,
  },
  {
    slug: 'tottenham-left-back-transfer-analysis',
    title: '토트넘 왼쪽 풀백 영입은 왜 중요한가',
    description:
      '토트넘 전술에서 왼쪽 풀백 보강이 중요한 이유를 전술 역할과 스쿼드 밸런스 관점에서 분석합니다.',
    excerpt:
      '왼쪽 풀백은 단순 수비수가 아니라 전개, 압박, 하프스페이스 지원까지 담당하는 핵심 포지션입니다.',
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
]