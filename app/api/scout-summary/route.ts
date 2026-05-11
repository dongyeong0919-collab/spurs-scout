import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, position, currentClub, nationality, age, fitScore, scoutTier } =
      body

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `
너는 토트넘 전술 스카우트 분석가다.

선수명: ${name}
포지션: ${position}
현재 소속팀: ${currentClub}
국적: ${nationality}
나이: ${age}
전술 적합도: ${fitScore}
Scout Tier: ${scoutTier}

반드시 아래 JSON 형식만 반환해라.
설명 문장, 마크다운, 코드블록은 절대 쓰지 마라.

{
  "linkReason": "토트넘 관점에서 이 선수가 연결되는 이유를 2~3문장으로 작성",
  "conclusion": "한줄 결론",
  "readyNow": "즉시전력감 평가",
  "riskSummary": "핵심 리스크",
  "roleSummary": "전술 역할",
  "chemistry": "케미 좋은 선수 2~3명",
  "pros": ["장점1", "장점2", "장점3", "장점4"],
  "cons": ["단점1", "단점2", "단점3"]
}
`,
    })

    const cleanText = response.output_text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const report = JSON.parse(cleanText)

    return NextResponse.json({ report })
  } catch (error) {
    console.error('AI Scout Error:', error)

    return NextResponse.json(
      { error: 'AI Scout Report 생성 실패' },
      { status: 500 }
    )
  }
}