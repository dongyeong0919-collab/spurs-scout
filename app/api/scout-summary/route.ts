import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'AI Scout 기능은 현재 준비 중입니다.',
    },
    {
      status: 503,
    }
  )
}