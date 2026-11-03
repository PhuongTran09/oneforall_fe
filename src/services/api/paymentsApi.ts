import { apiClient } from './client'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentHistoryItem,
  PaymentHistoryResponse,
} from './types'
import { stripLocale, withLocale } from '../../i18n/langStore'


export const PREMIUM_PLAN_ID = 'premium'

const MARKER_KEY = 'ofa-checkout'


export function buildReturnUrl(exit: '' | 'cancel' | 'error'): string {
  const lang = stripLocale(window.location.pathname).lang
  const path = withLocale('/payment-return', lang)
  return `${window.location.origin}${path}${exit ? `?exit=${exit}` : ''}`
}

export interface CheckoutMarker {
  paymentId: string
  orderCode: number
}


export const checkoutMarker = {
  save(marker: CheckoutMarker): void {
    try {
      sessionStorage.setItem(MARKER_KEY, JSON.stringify(marker))
    } catch {
      // Không ghi được marker thì trang callback bỏ đối chiếu, thanh toán vẫn chạy
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
      // Marker cũ không xoá được thì callback chỉ đọc sai một lần, không hỏng luồng
    }
  },
}

export const paymentsApi = {

  async create(body: CreatePaymentRequest, signal?: AbortSignal): Promise<CreatePaymentResponse> {
    return apiClient.post<CreatePaymentResponse>('/v1/payments/sepay', body, { signal })
  },


  async getStatus(id: string, signal?: AbortSignal): Promise<PaymentHistoryItem> {
    return apiClient.get<PaymentHistoryItem>(`/v1/payments/${id}`, { signal })
  },

  async history(limit: number, signal?: AbortSignal): Promise<PaymentHistoryItem[]> {
    const res = await apiClient.get<PaymentHistoryResponse>('/v1/payments/history', {
      params: { limit },
      signal,
    })
    return res?.payments ?? []
  },

  async latest(signal?: AbortSignal): Promise<PaymentHistoryItem | null> {
    return (await this.history(1, signal))[0] ?? null
  },
}
