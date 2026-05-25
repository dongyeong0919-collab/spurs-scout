import Image from 'next/image'
import Link from 'next/link'

const navItems = [
  {
    label: '이적시장',
    href: '/transfer',
  },
  {
    label: '비교',
    href: '/compare',
  },
  {
    label: '뉴스',
    href: '/news',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7f8fa_0%,#eef1f5_50%,#f8f9fb_100%)] text-[#0b1020]">
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-5 pb-16 pt-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-[#132257] no-underline"
          >
            SPURS SCOUT
          </Link>

          <nav className="flex items-center gap-3 text-sm font-bold text-[#132257] sm:gap-5 sm:text-base">
            <Link
              href="/admin"
              prefetch={false}
              className="no-underline transition hover:text-[#8FB8FF]"
            >
              관리자
            </Link>

            <span className="h-4 w-px bg-[#132257]/25" />

            <Link
              href="/privacy"
              className="no-underline transition hover:text-[#8FB8FF]"
            >
              개인정보처리방침
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="relative flex flex-col items-center">
            <div className="absolute inset-0 -z-10 rounded-full bg-[#132257]/10 blur-3xl" />

            <Image
              src="/spurs-scout-logo.png"
              alt="SPURS SCOUT logo"
              width={250}
              height={250}
              priority
              className="object-contain drop-shadow-[0_28px_45px_rgba(19,34,87,0.22)] sm:h-[300px] sm:w-[300px]"
            />

            <p className="mt-8 text-xs font-black tracking-[8px] text-[#132257] sm:text-sm">
              TOTTENHAM HOTSPUR
            </p>
          </div>
        </section>

        <section>
          <nav className="grid overflow-hidden rounded-2xl border border-[#26314f] bg-[#0b1020] shadow-[0_18px_55px_rgba(11,16,32,0.20)] sm:grid-cols-3">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-[72px] items-center justify-center bg-[#0b1020] px-5 text-center no-underline transition-all duration-200 hover:bg-[#132257] sm:h-[76px] ${
                  index !== navItems.length - 1
                    ? 'border-b border-white/10 sm:border-b-0 sm:border-r'
                    : ''
                }`}
              >
                <span className="block text-[20px] font-black leading-none tracking-tight text-white sm:text-[22px]">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="mt-12 flex min-h-[340px] items-center justify-center rounded-[28px] border border-[#d8dde8] bg-white/70 text-center shadow-[0_22px_70px_rgba(11,16,32,0.10)] backdrop-blur">
          <div>
            <p className="text-xs font-black tracking-[4px] text-[#9aa2b3]">
              AD / NOTICE
            </p>

            <p className="mt-3 text-2xl font-black text-[#8a92a3]">
              광고 영역
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}