# finn-tech 앱 인증 흐름 (Supabase + Next.js + Jotai)

이 문서는 `finn-tech` 앱의 인증 및 세션 관리 흐름을 설명합니다.

## 주요 파일

* **`middleware.ts`**: (루트) 모든 요청을 가로채 세션을 갱신하고, 보호된 경로에 대한 접근을 제어(리디렉션)합니다.
* **`@repo/database` (패키지)**: 모노레포 공통 Supabase 유틸리티.
  * `createClient`: (브라우저용) 클라이언트 컴포넌트에서 사용합니다.
  * `createServerClient`: (서버용) 서버 컴포넌트, 서버 액션, Route 핸들러에서 사용합니다.
  * `createMiddlewareClient`: (미들웨어용) `middleware.ts`에서 사용합니다.
* **`app/layout.tsx`**: (src) 루트 레이아웃. `@repo/database`의 `createServerClient`로 최초 세션 정보를 가져와 `AuthProvider`에 주입합니다.
* **`app/components/AuthProvider.tsx`**: (src) 클라이언트 컴포넌트. `layout`에서 받은 초기 세션을 Jotai 아톰에 설정하고, 클라이언트의 인증 상태 변경(`onAuthStateChange`)을 구독하여 Jotai 아톰을 실시간으로 업데이트합니다.
* **`lib/jotai/atoms.ts`**: (src) `sessionAtom`, `userAtom` 등 전역 세션 상태를 정의합니다.
* **`app/login/page.tsx`**: (src) 클라이언트 컴포넌트. `@repo/database`의 `createClient`를 사용하여 Google OAuth 로그인을 트리거합니다.
* **`app/auth/callback/route.ts`**: (src) Google 로그인 성공 시 리디렉션되는 서버 경로. `@repo/database`의 `createServerClient`를 사용해 `code`를 `session`으로 교환하고 쿠키를 설정합니다.

---

## 시나리오별 흐름

### 1. 로그아웃 상태로 보호된 페이지(`/dashboard`) 접근

1.  **요청**: 사용자가 `/dashboard`에 접근합니다.
2.  **`middleware.ts`**:
  * 요청을 가로챕니다.
  * `@repo/database`의 `createMiddlewareClient`로 클라이언트를 생성합니다.
  * `supabase.auth.getUser()`를 (쿠키 기반으로) 호출하지만, 유저 정보(`user`)가 `null`입니다.
  * `/dashboard`가 보호된 경로(`protectedPaths`) 목록에 있는지 확인합니다.
  * `user`가 없으므로 로그인 페이지로 리디렉션합니다.
  * **응답**: `NextResponse.redirect('/login?next=/dashboard')` (원래 가려던 경로를 `next` 파라미터로 전달)

### 2. 로그인 페이지(`/login`) 방문 및 Google 로그인 클릭

1.  **요청**: 사용자가 `/login?next=/dashboard`에 접근합니다.
2.  **`middleware.ts`**:
  * 요청을 가로챕니다.
  * `user`는 `null`이고, 경로가 `/login`이므로 통과시킵니다. (`NextResponse.next()`)
3.  **`layout.tsx` (서버)**:
  * `@repo/database`의 `createServerClient().getSession()`을 호출하지만, `session`은 `null`입니다.
4.  **`AuthProvider.tsx` (클라이언트)**:
  * `initialSession={null}`을 받습니다.
  * `sessionUpdateAtom(null)`을 호출하여 Jotai의 `userAtom`과 `sessionAtom`을 `null`로 설정합니다.
5.  **`login/page.tsx` (클라이언트)**:
  * `useAtomValue(userAtom)`은 `null`이므로 로그인 버튼을 렌더링합니다.
6.  **사용자 클릭**: 사용자가 "Google 계정으로 로그인" 버튼을 클릭합니다.
7.  **`handleGoogleLogin` (클라이언트)**:
  * `useSearchParams()`로 `next` 파라미터 (`/dashboard`)를 가져옵니다.
  * `@repo/database`의 `createClient().auth.signInWithOAuth`를 호출합니다.
  * `redirectTo` 옵션을 `.../auth/callback?next=/dashboard`로 설정합니다.
8.  **리디렉션**: 브라우저가 Google 로그인 페이지로 이동합니다.

### 3. Google 인증 후 콜백 처리

1.  **요청**: Google 로그인이 성공하면, Google은 `redirectTo`에 설정된 `.../auth/callback?next=/dashboard`로 사용자를 리디렉션시킵니다. (URL에 `code` 포함)
2.  **`app/auth/callback/route.ts` (서버)**:
  * `GET` 핸들러가 요청을 받습니다.
  * URL에서 `code`와 `next` (`/dashboard`) 파라미터를 추출합니다.
  * `@repo/database`의 `createServerClient()`로 서버용 Supabase 클라이언트를 생성합니다.
  * `supabase.auth.exchangeCodeForSession(code)`를 호출하여 `code`를 세션(토큰)으로 교환합니다.
  * 이 과정에서 `createServerClient`의 `setAll` 쿠키 메서드가 호출되어, **응답 헤더에 `sb-access-token` 등 인증 쿠키가 설정됩니다.**
3.  **리디렉션**: `route.ts`가 `NextResponse.redirect('.../dashboard')` (원본 `origin` + `next` 경로) 응답을 반환합니다.

### 4. 로그인 완료 후 보호된 페이지(`/dashboard`) 접근

1.  **요청**: 브라우저가 3단계의 리디렉션 응답을 받아 `/dashboard`로 새 요청을 보냅니다. (이때 **인증 쿠키**를 함께 전송합니다.)
2.  **`middleware.ts`**:
  * 요청을 가로챕니다.
  * `supabase.auth.getUser()`가 **쿠키를 읽어 `user` 객체를 성공적으로 반환합니다.**
  * `/dashboard`가 보호된 경로이지만 `user`가 존재하므로, 요청을 통과시킵니다. (`NextResponse.next()`)
3.  **`layout.tsx` (서버)**:
  * `@repo/database`의 `createServerClient().getSession()`이 **쿠키를 읽어 `session` 객체를 성공적으로 반환합니다.**
4.  **`AuthProvider.tsx` (클라이언트)**:
  * `initialSession={session}` (유효한 세션)을 받습니다.
  * `sessionUpdateAtom(session)`을 호출하여 Jotai의 `userAtom`과 `sessionAtom`에 **전역적으로 세션 정보가 설정됩니다.**
5.  **`dashboard` 페이지 렌더링**:
  * 페이지 내의 컴포넌트들이 `useAtomValue(userAtom)`을 사용해 사용자 정보를 렌더링할 수 있습니다.

### 5. (예외) 로그인 상태로 `/login` 페이지 접근

1.  **요청**: 이미 로그인한 사용자가 `/login` 페이지에 접근합니다.
2.  **`middleware.ts`**:
  * 요청을 가로챕니다.
  * `supabase.auth.getUser()`가 `user` 객체를 반환합니다.
  * `if (user && pathname === '/login')` 조건이 참이 됩니다.
  * **응답**: `NextResponse.redirect('/')` (홈으로 리디렉션)
