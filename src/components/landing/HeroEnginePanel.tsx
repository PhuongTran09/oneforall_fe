import { useEffect, useState } from 'react'
import { Check, Clock, Loader2 } from 'lucide-react'
import { t } from '../../i18n/langStore'

/*
  Crimson Workflow Monitor — landing-page demo (clearly labelled) of the real
  OneForAll pipeline: HTTP request → validation → Celery queue → worker
  processing → R2 upload → job status → download. Steps mirror app/worker/tasks/*
  but the backend emits no per-step events, so this is a visual loop, not live data.
  prefers-reduced-motion: frozen in the completed state.
*/

const TICK_MS = 1400
const CYCLE = 16 // ticks per full demo loop
const FROZEN_CYCLE = CYCLE - 1 // reduced-motion snapshot: everything done

const OVERVIEW_STAGE_KEYS = [
  'engine.stage1',
  'engine.stage2',
  'engine.stage3',
  'engine.stage4',
  'engine.stage5',
  'engine.stage6',
] as const

interface Step {
  nameKey: string
  stage: number
}

interface DemoJob {
  labelKey: string
  labelClass: string
  badge: string
  badgeClass: string
  file: string
  footKey: string
  start: number
  steps: Step[]
}

const s = (nameKey: string, stage: number): Step => ({ nameKey, stage })

const jobs: DemoJob[] = [
  {
    labelKey: 'engine.removeBgLabel',
    labelClass: 'text-[#FF3B30]',
    badge: 'AI',
    badgeClass: 'bg-[#ff3b30]/15 text-[#FF3B30] border border-[rgba(255,59,48,0.35)]',
    file: 'portrait_sample.png',
    footKey: 'engine.removeBgFoot',
    start: 0,
    steps: [
      s('engine.stepRequest', 0),
      s('engine.stepCheckImage', 1),
      s('engine.stepQueue', 2),
      s('engine.stepDownloadImage', 3),
      s('engine.stepRemoveBg', 3),
      s('engine.stepSaveResult', 4),
      s('engine.stepUpdateStatus', 5),
      s('engine.stepReady', 5),
    ],
  },
  {
    labelKey: 'engine.youtubeLabel',
    labelClass: 'text-[#FF6B4A]',
    badge: 'Full HD MP4',
    badgeClass: 'bg-amber-900/20 text-amber-400 border border-amber-500',
    file: 'music_video_hd.mp4',
    footKey: 'engine.youtubeFoot',
    start: 3,
    steps: [
      s('engine.stepRequest', 0),
      s('engine.stepCheckLink', 1),
      s('engine.stepQueue', 2),
      s('engine.stepDownloadVideo', 3),
      s('engine.stepMuxAudio', 3),
      s('engine.stepSaveResult', 4),
      s('engine.stepUpdateStatus', 5),
      s('engine.stepReady', 5),
    ],
  },
  {
    labelKey: 'engine.docLabel',
    labelClass: 'text-indigo-400',
    badge: 'DOCX → PDF',
    badgeClass: 'bg-indigo-900/20 text-indigo-400',
    file: 'bao_cao_tai_chinh.docx',
    footKey: 'engine.docFoot',
    start: 6,
    steps: [
      s('engine.stepRequest', 0),
      s('engine.stepCheckDoc', 1),
      s('engine.stepQueue', 2),
      s('engine.stepConvertDoc', 3),
      s('engine.stepSaveResult', 4),
      s('engine.stepUpdateStatus', 5),
      s('engine.stepReady', 5),
    ],
  },
]

type JobState = { status: 'queued' | 'active' | 'done'; step: number; stage: number }

function jobState(job: DemoJob, cycle: number): JobState {
  const rel = cycle - job.start
  if (rel < 0) return { status: 'queued', step: -1, stage: -1 }
  if (rel >= job.steps.length) return { status: 'done', step: job.steps.length, stage: 6 }
  return { status: 'active', step: rel, stage: job.steps[rel].stage }
}

const LEGEND_KEYS = [
  { labelKey: 'engine.legendDone', dot: 'bg-emerald-400' },
  { labelKey: 'engine.legendActive', dot: 'bg-[#FF3B30]' },
  { labelKey: 'engine.legendQueued', dot: 'bg-amber-400' },
  { labelKey: 'engine.legendPending', dot: 'bg-slate-600' },
  { labelKey: 'engine.legendError', dot: 'bg-rose-500' },
]

export function HeroEnginePanel() {
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  const cycle = reduceMotion ? FROZEN_CYCLE : tick % CYCLE
  const states = jobs.map((job) => jobState(job, cycle))

  const stageState = (stage: number): 'complete' | 'active' | 'pending' => {
    if (states.every((st) => st.stage > stage)) return 'complete'
    if (states.some((st) => st.status === 'active' && st.stage === stage)) return 'active'
    return 'pending'
  }

  return (
    <div className="relative p-4 sm:p-6 bg-surface border border-[rgba(255,59,48,0.25)] card-3d card-3d-dim clip-corner-lg">
      {/* Monitor header + legend */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-4 border-b border-edge/60 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 bg-[#FF3B30] clip-corner-btn" />
          <span className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
            Crimson Workflow Monitor
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-elev text-slate-500 border border-edge">
            demo · simulated
          </span>
        </div>
        <div className="flex items-center gap-3">
          {LEGEND_KEYS.map((l) => (
            <span key={l.labelKey} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
              {t(l.labelKey)}
            </span>
          ))}
        </div>
      </div>

      {/* Workflow Overview */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 mb-4">
        {OVERVIEW_STAGE_KEYS.map((stageKey, i) => {
          const state = stageState(i)
          return (
            <div key={stageKey} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold clip-corner-btn ${
                    state === 'complete'
                      ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-600/40'
                      : state === 'active'
                        ? 'bg-[#ff3b30]/15 text-[#FF3B30] border border-[rgba(255,59,48,0.5)] animate-pulse'
                        : 'bg-page text-slate-600 border border-edge'
                  }`}
                >
                  {state === 'complete' ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-mono uppercase tracking-wide ${
                    state === 'active' ? 'text-[#FF3B30] font-bold' : state === 'complete' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {t(stageKey)}
                </span>
              </div>
              {i < OVERVIEW_STAGE_KEYS.length - 1 && (
                <span className={`h-px w-4 sm:w-8 ${state === 'complete' ? 'bg-emerald-600/40' : 'bg-edge'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Execution Details — one timeline row per job */}
      <div className="flex flex-col gap-3">
        {jobs.map((job, ji) => {
          const st = states[ji]
          return (
            <div key={job.file} className="p-4 bg-elev border border-edge space-y-2.5 clip-corner-card">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-semibold ${job.labelClass}`}>{t(job.labelKey)}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 font-bold ${job.badgeClass}`}>{job.badge}</span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                  {st.status === 'queued' && (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-500">{t('engine.queued')}</span>
                    </>
                  )}
                  {st.status === 'active' && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-[#FF3B30] animate-spin" />
                      <span className="text-amber-400">{t(job.steps[st.step].nameKey)}</span>
                    </>
                  )}
                  {st.status === 'done' && (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{t('engine.stepReady')}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {job.steps.map((step, si) => (
                  <span
                    key={step.nameKey + si}
                    title={t(step.nameKey)}
                    className={`h-1.5 flex-1 ${
                      si < st.step
                        ? 'bg-emerald-500/70'
                        : si === st.step
                          ? 'bg-brand-gradient animate-pulse'
                          : 'bg-edge'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="truncate">
                  {job.file} <span className="text-slate-600">· {t(job.footKey)}</span>
                </span>
                <span className="font-mono shrink-0">
                  {st.status === 'queued'
                    ? t('engine.legendQueued')
                    : st.status === 'done'
                      ? `${job.steps.length}/${job.steps.length}`
                      : `${st.step + 1}/${job.steps.length}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
