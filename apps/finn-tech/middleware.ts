import { createMiddlewareClient } from '@repo/database'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // 응답 객체를 미리 생성
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // [수정] @repo/database의 공통 함수를 사용하여
  // 미들웨어 전용 Supabase 클라이언트를 생성합니다.
  const supabase = await createMiddlewareClient(request, response)

  // [핵심] 세션 갱신 (쿠키가 만료된 경우)
  // getUser() 호출 시 토큰이 만료되었으면 setAll이 호출되어 쿠키가 갱신됩니다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- 보호된 경로(Authorization) 로직 ---
  const protectedPaths = ['/', '/dashboard', '/settings'] // 보호할 경로 목록 (예시)
  const { pathname } = request.nextUrl

  // 보호된 경로에 접근 시도
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // 로그인되어 있지 않다면 로그인 페이지로 리디렉션
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname) // 원래 가려던 경로 전달
      return NextResponse.redirect(url)
    }
  }

  // (개선) 로그인한 사용자가 /login 페이지 접근 시 -> 홈으로 리디렉션
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 세션이 갱신되었다면, 갱신된 쿠키가 포함된 응답을 반환
  return response
}

export const config = {
  matcher: [
    /*
     * 모든 요청 경로에서 미들웨어를 실행하되,
     * API, _next/static, _next/image, favicon.ico 경로는 제외합니다.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
