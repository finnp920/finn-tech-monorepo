'use client' // 클라이언트 컴포넌트

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/jotai/atoms'
import { createClient } from '@repo/database'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Jotai 아톰에서 현재 사용자 정보를 가져옵니다.
  const user = useAtomValue(userAtom)

  // (개선) middleware가 리디렉션하지만, 클라이언트에서도 한 번 더 확인
  useEffect(() => {
    if (user) {
      // 'next' 파라미터가 있으면 그곳으로, 없으면 홈으로
      const next = searchParams.get('next') ?? '/'
      router.replace(next)
    }
  }, [user, router, searchParams])

  const handleGoogleLogin = async () => {
    // 미들웨어에서 /login으로 리디렉션할 때 전달한 'next' 파라미터를 가져옵니다.
    const next = searchParams.get('next')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 로그인 성공 후 /auth/callback을 거쳐
        // 최종적으로 리디렉션될 경로를 지정합니다.
        redirectTo: `${location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    })

    if (error) {
      console.error('Google 로그인 오류:', error)
      // TODO: 사용자에게 오류 메시지 표시
    }
  }

  // 사용자가 이미 로드되었으면 (로그인 상태)
  if (user) {
    return <div>로그인되어 있습니다. 이동 중...</div>
  }

  // (개선) 로그인 페이지 UI
  return (
    <div className="font-inter flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">finn-tech</h2>
          <p className="mt-2 text-sm text-gray-600">
            CMS에 오신 것을 환영합니다
          </p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition-colors duration-150 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          {/* Google SVG 아이콘 */}
          <svg
            className="mr-3 h-5 w-5"
            aria-hidden="true"
            focusable="false"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 381.4 512 244 512 110.3 512 0 401.7 0 261.8S110.3 11.6 244 11.6c70.3 0 132.3 28.5 176.2 72.8l-63.7 61.9C333.6 118.4 291.1 96.6 244 96.6c-94.2 0-170.6 76.4-170.6 170.6s76.4 170.6 170.6 170.6c100.3 0 152.2-80.9 158.3-124.2H244v-79.1h236.2c2.4 12.7 4.5 26.2 4.5 40.5z"
            ></path>
          </svg>
          Google 계정으로 로그인
        </button>
      </div>
    </div>
  )
}
