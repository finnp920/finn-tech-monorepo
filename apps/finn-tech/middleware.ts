import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@repo/database'

/**
 * 'publicPaths' 목록에 없는 모든 경로를 보호합니다.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 미들웨어용 Supabase 클라이언트 생성 (request, response 전달)
  const supabase = await createMiddlewareClient(request, response)

  // 현재 사용자 세션 정보 가져오기 (및 토큰 갱신)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 공개적으로 접근 가능한 경로 목록
  const publicPaths = [
    '/login', // 로그인 페이지
    '/auth/callback', // Supabase 인증 콜백 경로
  ]

  // 현재 경로가 publicPaths에 포함되는지 확인
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    // [공개 경로 접근 시]
    if (user) {
      // 이미 로그인한 사용자가 /login 페이지 등에 접근하면 홈('/')으로 리디렉션
      return NextResponse.redirect(new URL('/', request.url))
    }
    // 로그인하지 않은 사용자는 공개 경로 접근 허용 (루프 방지)
    return response
  }

  // [보호된 경로 접근 시 (isPublicPath === false)]
  if (!user) {
    // 로그인하지 않은 사용자는 /login으로 리디렉션
    // (원래 접근하려던 경로를 'next' 파라미터로 추가)
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 7. (필수) 로그인한 사용자는 모든 경로 접근 허용 및 세션 갱신
  return response
}

/**
 * 미들웨어가 실행될 경로를 지정합니다.
 * /_next/ (Next.js 내부)
 * /api/ (API 경로)
 * /static/ (정적 파일)
 * /favicon.ico (파비콘)
 * ...등 불필요한 경로는 제외합니다.
 */
export const config = {
  matcher: [
    /*
     * 모든 요청 경로에서 이 미들웨어를 실행하되,
     * 내부 정적 파일이나 API 경로는 제외합니다.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
