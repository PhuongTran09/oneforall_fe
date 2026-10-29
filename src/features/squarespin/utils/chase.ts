/**
 * Máy chạy ánh sáng thay cho kim: kết quả đã chốt TRƯỚC khi quay, lịch chỉ việc
 * chạy đủ số vòng rồi dừng đúng ô trúng (số học modulo). Hàm thuần, không đụng DOM.
 */

/** Nhịp tối thiểu để mắt còn đọc được từng ô (ms). */
const CRUISE_STEP_MS = 45
/** Sàn tuyệt đối: ngắn hơn nữa ánh sáng thành nhòe. */
const HARD_MIN_STEP_MS = 26
/** Tỷ trọng số bước cuối dành cho đoạn phanh. */
const BRAKE_SHARE = 0.15
/** Bước phanh cuối chậm gấp mấy lần bước chạy đều. */
const BRAKE_RATIO = 4

export interface ChaseStep {
  /** Ô được rọi sáng ở bước này. */
  slot: number
  /** Mốc thời gian tích lũy kể từ lúc bắt đầu quay (ms). */
  atMs: number
}

export interface ChasePlan {
  steps: ChaseStep[]
  /** Đúng bằng `spinMs` trừ khi không thể (quá nhiều ô, quá ít thời gian). */
  totalMs: number
  /** Số vòng thật chạy — có thể ít hơn yêu cầu vì trần nhịp ở trên. */
  laps: number
}

export interface ChaseInput {
  /** Tổng số vị trí trên vành, kể cả ô trống. */
  slots: number
  startSlot: number
  winnerSlot: number
  laps: number
  spinMs: number
}

const mod = (x: number, m: number) => ((x % m) + m) % m

export function chaseSchedule({ slots, startSlot, winnerSlot, laps, spinMs }: ChaseInput): ChasePlan {
  const ring = Math.max(1, Math.round(slots))
  const winner = mod(Math.round(winnerSlot), ring)
  const start = mod(Math.round(startSlot), ring)
  const offset = mod(winner - start, ring)

  // Giảm chuyển động: không chạy, chỉ sáng đúng ô trúng.
  if (spinMs <= 0) return { steps: [{ slot: winner, atMs: 0 }], totalMs: 0, laps: 0 }

  const stepsAt = (rounds: number) => rounds * ring + offset + 1
  // Ưu tiên đọc được từng ô hơn là quay đủ vòng: hạ số vòng xuống mức lớn nhất còn
  // đảm bảo nhịp >= CRUISE, tối thiểu một vòng trọn vành.
  let rounds = Math.max(1, Math.round(laps))
  while (rounds > 1 && spinMs / stepsAt(rounds) < CRUISE_STEP_MS) rounds -= 1
  const n = stepsAt(rounds)

  const gaps = n - 1
  const braking = Math.min(gaps, Math.max(1, Math.round(n * BRAKE_SHARE)))
  const weight = (i: number) =>
    i < gaps - braking ? 1 : BRAKE_RATIO ** ((i - (gaps - braking)) / Math.max(1, braking - 1))
  const sumW = Array.from({ length: gaps }, (_, i) => weight(i)).reduce((a, b) => a + b, 0)
  const unit = Math.max(spinMs / sumW, HARD_MIN_STEP_MS)

  const steps: ChaseStep[] = [{ slot: start, atMs: 0 }]
  let at = 0
  for (let i = 0; i < gaps; i += 1) {
    at += unit * weight(i)
    steps.push({ slot: mod(start + i + 1, ring), atMs: Math.round(at) })
  }
  return { steps, totalMs: steps[steps.length - 1]!.atMs, laps: rounds }
}
