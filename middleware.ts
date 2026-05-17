import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  if (!isAdminPage) {
    return NextResponse.next()
  }

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const decoded = Buffer.from(authValue, 'base64').toString()
    const [user, pass] = decoded.split(':')

    if (user === username && pass === password) {
      return NextResponse.next()
    }
  }

  return new NextResponse('관리자 인증이 필요합니다.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}