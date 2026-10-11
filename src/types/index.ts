export interface NavigationItem {
  to: string
  label: string
}

export interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}
