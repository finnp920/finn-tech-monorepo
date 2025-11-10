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
  const user = useAtomValue(userAtom) // Jotai에서 사용자 정보 읽기

  // 'next' 파라미터 (보호된 경로에서 리디렉션된 경우)
  const nextPath = searchParams.get('next') ?? '/'

  // 이미 로그인한 사용자인지 확인 (Jotai 아톰 기반)
  useEffect(() => {
    if (user) {
      router.push(nextPath) // 이미 로그인했다면 원래 가려던 곳(next) 또는 홈으로
    }
  }, [user, router, nextPath])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (error) {
      console.error('Google 로그인 오류:', error)
    }
  }

  // user가 로드 중이거나 이미 로그인된 경우 (깜빡임 방지)
  if (user) {
    return <div>로그인되어 있습니다. 이동 중...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          finn-tech 로그인
        </h2>
        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        >
          {/* 간단한 Google SVG 아이콘 */}
          <svg
            className="mr-2 inline h-5 w-5"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
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
