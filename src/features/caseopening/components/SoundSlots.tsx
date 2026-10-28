import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Music, Play, RotateCcw, Square, Trash2, Upload } from 'lucide-react'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import type { AssetId, CaseSettings, SoundSlot } from '../types'
import { patchSettings, setSound, uploadAsset } from '../store/caseStore'
import { useAssetName } from '../hooks/useAssetUrls'
import { audioEngine } from '../utils/audio'
import { isAssetStoreAvailable } from '../utils/assets'
import { BUILTIN_SOUND_PACK } from '../utils/builtinSounds'
import { AUDIO_MAX_BYTES, formatBytes, validateAudioFile } from '../utils/images'
import { RangeField, SwitchField } from './FormControls'

const SLOTS: SoundSlot[] = ['spin', 'open', 'reward', 'rare']

const labelKey: Record<SoundSlot, string> = {
  spin: 'case.sound.spin',
  open: 'case.sound.open',
  reward: 'case.sound.reward',
  rare: 'case.sound.rare',
}

export interface SoundSlotsProps {
  caseId: string
  sounds: Partial<Record<SoundSlot, AssetId>>
  settings: CaseSettings
}

export function SoundSlots({ caseId, sounds, settings }: SoundSlotsProps) {
  const [storeOk, setStoreOk] = useState(true)

  useEffect(() => {
    let alive = true
    void isAssetStoreAvailable().then((ok) => {
      if (alive) setStoreOk(ok)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-page border border-edge clip-corner-card">
        <SwitchField
          label={t('case.soundEnabled')}
          checked={settings.soundEnabled}
          onChange={(next) => patchSettings({ soundEnabled: next })}
          hint={t('case.soundEnabledHint')}
        />
        <RangeField
          label={t('case.volume')}
          value={Math.round(settings.volume * 100)}
          onChange={(next) => patchSettings({ volume: next / 100 })}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v}%`}
          disabled={!settings.soundEnabled}
        />
      </div>

      {!storeOk && (
        <p role="alert" className="text-xs text-brand leading-relaxed">
          {t('case.err.assetStoreUnavailable')}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {SLOTS.map((slot) => (
          <SoundSlotRow key={slot} slot={slot} caseId={caseId} assetId={sounds[slot]} disabled={!storeOk} settings={settings} />
        ))}
      </ul>

      <p className="text-xs text-slate-400 leading-relaxed">{t('case.soundNote')}</p>
    </div>
  )
}

interface SoundSlotRowProps {
  slot: SoundSlot
  caseId: string
  assetId?: AssetId
  disabled: boolean
  settings: CaseSettings
}

function SoundSlotRow({ slot, caseId, assetId, disabled, settings }: SoundSlotRowProps) {
  const previewKey = `preview:${slot}`
  const name = useAssetName(assetId)
  const isBuiltin = assetId === BUILTIN_SOUND_PACK[slot]
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(
    () => () => {
      audioEngine.stop(previewKey)
    },
    [previewKey],
  )

  const stopPreview = () => {
    audioEngine.stop(previewKey)
    setPlaying(false)
  }

  const preview = () => {
    if (!assetId) return
    audioEngine.configure({ enabled: settings.soundEnabled, volume: settings.volume })
    if (playing) {
      stopPreview()
      return
    }
    setPlaying(true)
    void audioEngine.play(previewKey, assetId, { restart: true, onEnded: () => setPlaying(false) })
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    const invalid = validateAudioFile(file)
    if (invalid) {
      setError(t(invalid, { max: formatBytes(AUDIO_MAX_BYTES) }))
      return
    }
    stopPreview()
    setError(null)
    setBusy(true)
    const id = await uploadAsset('audio', file, file.name)
    if (!id) {
      setBusy(false)
      setError(t('case.err.assetStoreUnavailable'))
      return
    }
    await setSound(caseId, slot, id)
    setBusy(false)
    showToast({ type: 'success', message: t('case.soundUpdated') })
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFile(e.target.files?.[0] ?? null)
    e.target.value = ''
  }

  return (
    <li className={`p-3 bg-page border transition-colors clip-corner-card ${error ? 'border-brand' : 'border-edge'}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-brand/10 border border-brand/30 text-brand clip-corner-btn">
          <Music className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-300">{t(labelKey[slot])}</p>
          <p className="text-[11px] font-mono text-slate-500 truncate">{name ?? t('case.soundEmpty')}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={!assetId || !settings.soundEnabled}
            onClick={preview}
            aria-label={playing ? t('case.soundStop') : t('case.soundPlay')}
            title={playing ? t('case.soundStop') : t('case.soundPlay')}
            className="inline-flex items-center justify-center w-9 h-9 bg-elev border border-edge text-slate-200 hover:border-[rgba(255,59,48,0.45)] hover:text-ink transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-40"
          >
            {playing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            disabled={isBuiltin || busy}
            onClick={() => {
              stopPreview()
              void setSound(caseId, slot, BUILTIN_SOUND_PACK[slot])
              showToast({ type: 'success', message: t('case.soundUpdated') })
            }}
            aria-label={t('case.soundUseBuiltin')}
            title={t('case.soundUseBuiltin')}
            className="inline-flex items-center justify-center w-9 h-9 bg-elev border border-edge text-slate-200 hover:border-[rgba(255,59,48,0.45)] hover:text-ink transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            aria-label={t('case.soundUpload')}
            title={t('case.soundUpload')}
            className="inline-flex items-center justify-center w-9 h-9 bg-elev border border-edge text-slate-200 hover:border-[rgba(255,59,48,0.45)] hover:text-ink transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!assetId || busy}
            onClick={() => {
              stopPreview()
              void setSound(caseId, slot, undefined)
            }}
            aria-label={t('case.soundClear')}
            title={t('case.soundClear')}
            className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer clip-corner-btn disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-brand leading-relaxed">
          {error}
        </p>
      )}

      <input ref={inputRef} type="file" accept="audio/*" onChange={onChange} className="hidden" aria-label={t(labelKey[slot])} />
    </li>
  )
}
