





const CRUISE_STEP_MS = 45

const HARD_MIN_STEP_MS = 26

const BRAKE_SHARE = 0.15

const BRAKE_RATIO = 4

export interface ChaseStep {

  slot: number

  atMs: number
}

export interface ChasePlan {
  steps: ChaseStep[]

  totalMs: number

  laps: number
}

export interface ChaseInput {

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


  if (spinMs <= 0) return { steps: [{ slot: winner, atMs: 0 }], totalMs: 0, laps: 0 }

  const stepsAt = (rounds: number) => rounds * ring + offset + 1


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
