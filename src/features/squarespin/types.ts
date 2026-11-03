export type SpinEntryId = string

export interface SpinEntry {
  id: SpinEntryId

  name: string

  color: string
}

export interface SpinList {
  entries: SpinEntry[]
}

export type SpinMode = 'single' | 'double'

export interface WheelConfig {

  spinMs: number

  rotations: number

  removeWinner: boolean
}

export interface SpinState {
  mode: SpinMode

  wheelA: WheelConfig

  wheelB: WheelConfig

  sharedConfig: boolean
  listA: SpinList
  listB: SpinList
  history: SpinRecord[]

  soundEnabled: boolean

  soundVolume: number
}

export type WheelSlot = 'A' | 'B'

export interface SpinRecord {
  id: string
  at: number
  slot: WheelSlot
  entryId: SpinEntryId
  name: string

  poolSize: number
}
