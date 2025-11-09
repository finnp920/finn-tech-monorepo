import { atom } from 'jotai'
import type { Session } from '@supabase/supabase-js'

/**
 * Supabase 세션 객체 전체를 저장하는 기본 아톰입니다.
 * 앱의 다른 부분에서는 이 아톰을 직접 사용하기보다
 * 파생된 userAtom이나 sessionAtom (읽기 전용)을 사용하는 것을 권장합니다.
 */
const baseSessionAtom = atom<Session | null>(null)

/**
 * 세션 객체를 설정(set)하기 위한 "쓰기 전용" 아톰입니다.
 * AuthProvider에서만 이 아톰을 사용하여 세션 상태를 업데이트해야 합니다.
 */
export const sessionUpdateAtom = atom(
  null, // 초기값 (읽기용이 아니므로 null)
  (_get, set, newSession: Session | null) => {
    set(baseSessionAtom, newSession)
  }
)

/**
 * 현재 세션 객체를 "읽기 전용"으로 제공하는 파생 아톰입니다.
 */
export const sessionAtom = atom((get) => get(baseSessionAtom))

/**
 * 현재 로그인된 사용자(User) 객체만 "읽기 전용"으로 제공하는 파생 아톰입니다.
 * UI 컴포넌트에서 사용자 이름이나 아바타를 표시할 때 유용합니다.
 */
export const userAtom = atom((get) => get(baseSessionAtom)?.user ?? null)
