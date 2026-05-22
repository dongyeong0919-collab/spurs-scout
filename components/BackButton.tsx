'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-6 rounded-full border border-white/20 bg-[#11162a] px-4 py-2 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-[#050816]"
    >
      ← 돌아가기
    </button>
  )
}