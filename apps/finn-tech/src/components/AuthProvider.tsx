'use client'

import { sessionUpdateAtom } from '@/lib/jotai/atoms'
import type { Session } from '@supabase/supabase-js'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { createClient } from '@repo/database'

/**
 * Supabase 인증 상태와 Jotai 아톰을 동기화하는 클라이언트 컴포넌트입니다.
 * 이 컴포넌트는 RootLayout에서 서버로부터 받은 초기 세션(initialSession)을
 * Jotai 아톰에 주입하고, 이후 클라이언트 사이드에서 발생하는
 * (로그인, 로그아웃, 토큰 갱신 등) 모든 인증 상태 변경을 감지하여
 * Jotai 아톰을 최신 상태로 유지합니다.
 */
export default function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: Session | null
  children: React.ReactNode
}) {
  const setSession = useSetAtom(sessionUpdateAtom)
  const supabase = createClient() // 클라이언트용 Supabase 클라이언트

  // 1. 최초 렌더링 시, 서버에서 전달받은 세션으로 Jotai 아톰을 초기화합니다.
  // (의존성 배열이 비어있으므로 한 번만 실행됩니다)
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. 클라이언트에서 Supabase의 인증 상태 변경(onAuthStateChange)을 구독합니다.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // 인증 이벤트(SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED 등)가
        // 발생할 때마다 Jotai 아톰을 최신 세션 정보로 업데이트합니다.
        setSession(session)
      }
    )

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, setSession])

  return <>{children}</>
}
