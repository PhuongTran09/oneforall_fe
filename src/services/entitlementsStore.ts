import { useSyncExternalStore } from 'react'
import { usersApi } from './api/usersApi'
import type { PlanPolicy, UserMe } from './api/types'
import { getAccessToken, subscribeAuthEvent } from './authStore'

/**
 * Quyền lợi gói (plan + PLAN_POLICIES) do BE trả về qua GET /users/me — FE không
 * tự định nghĩa giới hạn hay giá gói. Chưa có dữ liệu = coi như Free (fail-closed
 * cho phía quyền lợi, ads vẫn bật cho tới khi BE xác nhận Pro).
 */

interface EntitlementState {
  me: UserMe | null
  loading: boolean
}

let state: EntitlementState = { me: null, loading: false }
const listeners = new Set<() => void>()

function setState(next: EntitlementState) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

let inFlight: Promise<void> | null = null

// Cache plan cho snippet index.html (AdSense Auto ads nạp trước khi app boot):
// chỉ là bản copy một chiều từ /users/me — nguồn sự thật vẫn là BE.
function writePlanCache(plan: string | null) {
  try {
    if (plan) localStorage.setItem('ofa-plan', plan)
    else localStorage.removeItem('ofa-plan')
  } catch {
    // storage blocked → auto-ads không nạp (fail-closed phía privacy)
  }
}

// Supabase phát lại INITIAL_SESSION/SIGNED_IN mỗi lần tab lấy lại focus hoặc phiên được
// khôi phục, và ProfilePage cũng đọc từ store này — không chặn thì GET /users/me chạy lại
// liên tục dù dữ liệu không đổi. TTL chỉ áp khi cùng user; đổi user là fetch ngay.
const REFRESH_TTL_MS = 60_000
let lastFetchAt = 0
let lastFetchUserId: string | null = null

export function refreshEntitlements(force = false): Promise<void> {
  if (inFlight) return inFlight
  // Không có access token (chưa đăng nhập) → /users/me chỉ về 401; SIGNED_OUT đã clear state.
  if (getAccessToken() === null) return Promise.resolve()
  if (!force && state.me && lastFetchUserId === state.me.id && Date.now() - lastFetchAt < REFRESH_TTL_MS) {
    return Promise.resolve()
  }
  inFlight = (async () => {
    try {
      const me = await usersApi.getMe()
      lastFetchAt = Date.now()
      lastFetchUserId = me?.id ?? null
      writePlanCache(me?.plan ?? null)
      setState({ me, loading: false })
    } catch {
      // Lỗi mạng/token: giữ trạng thái cũ, lần fetch sau (auth event/reload) sửa lại.
      lastFetchAt = 0
      setState({ ...state, loading: false })
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

// Đăng nhập/đăng xuất/thay đổi user → refresh hoặc clear ngay, không đợi reload.
subscribeAuthEvent((event, session) => {
  if (event === 'SIGNED_OUT') {
    writePlanCache(null)
    lastFetchAt = 0
    lastFetchUserId = null
    setState({ me: null, loading: false })
    return
  }
  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
    const userId = session?.user?.id ?? null
    // Session của user khác với bản đang cache → bắt buộc bỏ TTL, nếu không trang sẽ hiển
    // thị plan/quyền lợi của người dùng trước đó. Chưa đăng nhập (userId null) thì
    // refreshEntitlements tự chặn, không gọi /users/me vô ích.
    void refreshEntitlements(userId !== null && userId !== lastFetchUserId)
  }
})

export function useEntitlements(): EntitlementState {
  return useSyncExternalStore(subscribe, () => state)
}

export function getPlanPolicy(me: UserMe | null): PlanPolicy | null {
  return me?.plan_policy ?? null
}

/** True khi BE xác nhận user Pro (plan premium hoặc policy.ads=false). */
export function isAdFree(me: UserMe | null): boolean {
  return me?.plan === 'premium' || me?.plan_policy?.ads === false
}
