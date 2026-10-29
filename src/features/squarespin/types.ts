export type SpinEntryId = string

export interface SpinEntry {
  id: SpinEntryId
  /** Tên hiển thị trong ô — giữ nguyên dấu tiếng Việt và khoảng trắng bên trong. */
  name: string
  /** Màu nền ô, hex `#rrggbb` — luôn có sau khi sanitize (`normalizeHex`). */
  color: string
}

export interface SpinList {
  entries: SpinEntry[]
}

export type SpinMode = 'single' | 'double'

export interface WheelConfig {
  /** Thời lượng một lượt quay (ms). */
  spinMs: number
  /** Số vòng quay trọn vẹn trước khi giảm tốc. */
  rotations: number
  /** Xoá kết quả trúng khỏi danh sách sau khi lượt quay kết thúc. */
  removeWinner: boolean
}

export interface SpinState {
  mode: SpinMode
  /** Cấu hình dùng cho wheel 1 (và cả hai wheel khi bật "dùng chung"). */
  wheelA: WheelConfig
  /** Wheel 2 ở chế độ Double Spin. */
  wheelB: WheelConfig
  /** Wheel 2 lấy lại cấu hình từ wheel 1 thay vì tự đặt. */
  sharedConfig: boolean
  listA: SpinList
  listB: SpinList
  history: SpinRecord[]
  /** Tiếng quay + nhạc thắng. Để sai kiểu trong localStorage thì về bật. */
  soundEnabled: boolean
  /** 0..1, chỉ có nghĩa khi `soundEnabled`. */
  soundVolume: number
}

export type WheelSlot = 'A' | 'B'

export interface SpinRecord {
  id: string
  at: number
  slot: WheelSlot
  entryId: SpinEntryId
  name: string
  /** Số ô đang quay ở lượt đó — để chứng minh xác suất 1/N. */
  poolSize: number
}
