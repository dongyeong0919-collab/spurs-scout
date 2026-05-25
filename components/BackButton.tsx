'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8dde8] bg-white px-5 py-2.5 text-sm font-black text-[#132257] shadow-[0_10px_30px_rgba(11,16,32,0.06)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#8FB8FF] hover:text-[#8FB8FF]"
    >
      <span className="text-base">←</span>
      <span>돌아가기</span>
    </button>
  )
}