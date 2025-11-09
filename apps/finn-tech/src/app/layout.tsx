import { Inter } from 'next/font/google'
import { Provider as JotaiProvider } from 'jotai'
import AuthProvider from '@/components/AuthProvider'
import './globals.css'
import { ReactNode } from 'react'
import { createServerClient } from '@repo/database'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'finn-tech CMS',
  description: 'Finn-Tech Content Management System',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // 서버 컴포넌트에서 최초 세션 정보를 가져옵니다.
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 1. JotaiProvider를 최상위에 배치합니다. */}
        <JotaiProvider>
          {/* 2. AuthProvider가 서버 세션을 받아 Jotai 아톰을 초기화합니다. */}
          <AuthProvider initialSession={session}>
            {/* 이제 {children} (모든 페이지 및 하위 컴포넌트)에서
              useAtom(userAtom) 등으로 로그인 상태를 사용할 수 있습니다.
            */}
            {children}
          </AuthProvider>
        </JotaiProvider>
      </body>
    </html>
  )
}
