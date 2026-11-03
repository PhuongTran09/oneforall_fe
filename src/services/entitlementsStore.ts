import { useSyncExternalStore } from 'react'
import { usersApi } from './api/usersApi'
import type { PlanPolicy, UserMe } from './api/types'
import { getAccessToken, subscribeAuthEvent } from './authStore'



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



function writePlanCache(plan: string | null) {
  try {
    if (plan) localStorage.setItem('ofa-plan', plan)
    else localStorage.removeItem('ofa-plan')
  } catch {
    // Cache gói chỉ để hiển thị sớm trước khi server trả về; không ghi được thì bỏ
  }
}




const REFRESH_TTL_MS = 60_000
let lastFetchAt = 0
let lastFetchUserId: string | null = null

export function refreshEntitlements(force = false): Promise<void> {
  if (inFlight) return inFlight

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

      lastFetchAt = 0
      setState({ ...state, loading: false })
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}


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



    void refreshEntitlements(userId !== null && userId !== lastFetchUserId)
  }
})

export function useEntitlements(): EntitlementState {
  return useSyncExternalStore(subscribe, () => state)
}

export function getPlanPolicy(me: UserMe | null): PlanPolicy | null {
  return me?.plan_policy ?? null
}


export function isAdFree(me: UserMe | null): boolean {
  return me?.plan === 'premium' || me?.plan_policy?.ads === false
}


export function isAdFreeNow(me: UserMe | null): boolean {
  if (me) return isAdFree(me)
  try {
    return localStorage.getItem('ofa-plan') === 'premium'
  } catch {
    return false
  }
}
