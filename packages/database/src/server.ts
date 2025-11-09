'use server'

import {
  type CookieOptions,
  createServerClient as _createServerClient,
} from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * [서버 컴포넌트/액션용]
 * 서버 환경 (RSC, 서버 액션)에서 사용하는 Supabase 클라이언트를 생성합니다.
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: {
            name: string
            value: string
            options: CookieOptions
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // 서버 컴포넌트에서 쿠키 설정 시도 시 발생 가능 (무시)
          }
        },
      },
    }
  )
}

/**
 * [미들웨어용]
 * Next.js 미들웨어에서 사용하는 Supabase 클라이언트를 생성합니다.
 */
export async function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  // [수정] _createMiddlewareClient 대신 _createServerClient 사용
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: {
            name: string
            value: string
            options: CookieOptions
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}
