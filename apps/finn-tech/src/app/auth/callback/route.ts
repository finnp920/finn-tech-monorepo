import { NextResponse } from 'next/server'
import { createServerClient } from '@repo/database'

// 구글 로그인 후 리디렉션되는 경로 (GET)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next'가 있다면 (예: 보호된 페이지 접근 시도) 해당 경로로 리디렉션
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 서버용 클라이언트 생성 (utils.ts에서 'cookies'를 자동으로 처리)
    const supabase = await createServerClient()

    // 전달받은 code를 Supabase 세션으로 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 성공 시 'next'에 지정된 경로 또는 홈('/')으로 리디렉션
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 오류 발생 시 (예: code가 없거나 교환 실패 시)
  console.error('인증 콜백 오류 발생')
  // 오류 페이지로 리디렉션 (간단하게 /login 페이지로 리디렉션)
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'Authentication failed')
  return NextResponse.redirect(errorUrl)
}
