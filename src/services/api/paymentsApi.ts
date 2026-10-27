import { apiClient } from './client'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentHistoryItem,
  PaymentHistoryResponse,
} from './types'
import { stripLocale, withLocale } from '../../i18n/langStore'

/** Catalog gói do BE seed (supabase/schema.sql): chỉ `free` (0đ) và `premium` là gói trả tiền. */
export const PREMIUM_PLAN_ID = 'premium'

const MARKER_KEY = 'ofa-checkout'

/** Trang SePay redirect người dùng về, cùng origin với trang đang xem (EN ở /en). */
export function buildReturnUrl(exit: '' | 'cancel' | 'error'): string {
  const lang = stripLocale(window.location.pathname).lang
  const path = withLocale('/payment-return', lang)
  return `${window.location.origin}${path}${exit ? `?exit=${exit}` : ''}`
}

export interface CheckoutMarker {
  paymentId: string
  orderCode: number
}

/** payment_id do BE sinh SAU khi nhận request, nên lúc dựng return_url không thể nhét nó */
export const checkoutMarker = {
  save(marker: CheckoutMarker): void {
    try {
      sessionStorage.setItem(MARKER_KEY, JSON.stringify(marker))
    } catch {
      // storage blocked → trang trả về fallback sang history[0]
    }
  },
  read(): CheckoutMarker | null {
    try {
      const raw = sessionStorage.getItem(MARKER_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as Partial<CheckoutMarker>
      return typeof parsed?.paymentId === 'string' && typeof parsed?.orderCode === 'number'
        ? { paymentId: parsed.paymentId, orderCode: parsed.orderCode }
        : null
    } catch {
      return null
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(MARKER_KEY)
    } catch {
      // không xoá được cũng chẳng sao: đơn đã paid, history[0] sẽ cho cùng kết luận
    }
  },
}

export const paymentsApi = {
  /** Tạo đơn và lấy bộ field đã ký. Cần đăng nhập; 503 khi BE chưa bật SePay. */
  async create(body: CreatePaymentRequest, signal?: AbortSignal): Promise<CreatePaymentResponse> {
    return apiClient.post<CreatePaymentResponse>('/v1/payments/sepay', body, { signal })
  },

  /** owner-scoped: id không phải UUID hoặc không phải của user → 404/422. */
  async getStatus(id: string, signal?: AbortSignal): Promise<PaymentHistoryItem> {
    return apiClient.get<PaymentHistoryItem>(`/v1/payments/${id}`, { signal })
  },

  /** BE sort created_at desc; `limit` được nhận 1..100 (app/api/v1/endpoints/payments.py). */
  async history(limit: number, signal?: AbortSignal): Promise<PaymentHistoryItem[]> {
    const res = await apiClient.get<PaymentHistoryResponse>('/v1/payments/history', {
      params: { limit },
      signal,
    })
    return res?.payments ?? []
  },

  /** BE sort created_at desc → phần tử đầu là đơn vừa tạo. */
  async latest(signal?: AbortSignal): Promise<PaymentHistoryItem | null> {
    return (await this.history(1, signal))[0] ?? null
  },
}
