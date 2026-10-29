import { useMemo, useState } from 'react'
import { Button } from '../../../components/common/Button'
import { showToast } from '../../../components/feedback/toastStore'
import { t } from '../../../i18n/langStore'
import type { CaseItem, Rarity } from '../types'
import { addItem, patchItem, uploadAsset } from '../store/caseStore'
import { dropAsset } from '../utils/assets'
import { toStorableImage } from '../utils/images'
import { formatPercent, sanitizeWeight } from '../utils/random'
import { RARITY_PRESETS } from '../defaults'
import { ColorField, Field, NumberField, SelectField, TextAreaField, TextField } from './FormControls'
import { ImagePicker } from './ImagePicker'
import { ModalShell } from './ModalShell'

export interface ItemEditorModalProps {
  caseId: string
  /** null = thêm vật phẩm mới. */
  item: CaseItem | null
  rarities: Rarity[]
  /** Toàn bộ vật phẩm của hòm (kể cả item đang sửa) — dùng tính xác suất hiển thị ngay. */
  caseItems: CaseItem[]
  existingImageUrl?: string
  onClose: () => void
}

/** Parent chỉ mount component này khi cần sửa, nên state khởi tạo thẳng từ props, không cần effect reset. */
export function ItemEditorModal({ caseId, item, rarities, caseItems, existingImageUrl, onClose }: ItemEditorModalProps) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [color, setColor] = useState(item?.color ?? RARITY_PRESETS[0])
  const [rarityId, setRarityId] = useState(item?.rarityId ?? rarities[0]?.id ?? '')
  const [weight, setWeight] = useState(item?.weight ?? 10)
  const [file, setFile] = useState<File | null>(null)
  const [dropImage, setDropImage] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedRarity = rarities.find((r) => r.id === rarityId) ?? rarities[0]

  // % hiển thị là xác suất THẬT của chính cấu hình đang soạn, không phải số trang trí.
  const chance = useMemo(() => {
    const mine = sanitizeWeight(weight) * sanitizeWeight(selectedRarity?.weight ?? 0)
    if (mine <= 0) return 0
    const others = caseItems
      .filter((i) => i.id !== item?.id)
      .reduce((acc, i) => acc + sanitizeWeight(i.weight) * sanitizeWeight(rarities.find((r) => r.id === i.rarityId)?.weight ?? 0), 0)
    return mine / (mine + others)
  }, [caseItems, item?.id, rarities, selectedRarity?.weight, weight])

  const handlePick = (next: File | null) => {
    setFile(next)
    if (next) setDropImage(false)
  }

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(t('case.err.itemNameRequired'))
      return
    }
    setSaving(true)

    let imageAssetId = item?.imageAssetId
    try {
      if (file) {
        const id = await uploadAsset('image', await toStorableImage(file), file.name)
        if (!id) {
          showToast({ type: 'error', message: t('case.err.assetStoreUnavailable') })
          setSaving(false)
          return
        }
        if (item?.imageAssetId) await dropAsset(item.imageAssetId)
        imageAssetId = id
      } else if (dropImage && item?.imageAssetId) {
        await dropAsset(item.imageAssetId)
        imageAssetId = undefined
      }

      const payload = {
        name: trimmed,
        description: description.trim(),
        color,
        rarityId: selectedRarity?.id ?? rarityId,
        weight: sanitizeWeight(weight),
        imageAssetId,
      }
      if (item) patchItem(caseId, item.id, payload)
      else addItem(caseId, payload)
      showToast({ type: 'success', message: item ? t('case.itemUpdated') : t('case.itemAdded') })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell
      isOpen
      title={item ? t('case.editItemTitle') : t('case.addItemTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" fullWidth size="md" onClick={onClose} disabled={saving}>
            {t('case.cancel')}
          </Button>
          <Button variant="primary" fullWidth size="md" onClick={() => void save()} isLoading={saving}>
            {t('case.save')}
          </Button>
        </>
      }
    >
      <ImagePicker label={t('case.itemImage')} existingUrl={item ? existingImageUrl : undefined} onPick={handlePick} disabled={saving} />

      <TextField
        label={t('case.itemName')}
        value={name}
        onChange={(next) => {
          setName(next)
          if (nameError) setNameError(null)
        }}
        maxLength={60}
        placeholder={t('case.itemNamePlaceholder')}
        invalid={Boolean(nameError)}
        error={nameError ?? undefined}
        disabled={saving}
      />

      <TextAreaField
        label={t('case.itemDescription')}
        value={description}
        onChange={setDescription}
        maxLength={160}
        placeholder={t('case.itemDescriptionPlaceholder')}
        disabled={saving}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label={t('case.itemRarity')}
          value={selectedRarity?.id ?? ''}
          options={rarities.map((r) => ({ value: r.id, label: r.name }))}
          onChange={setRarityId}
          disabled={saving}
        />
        <ColorField label={t('case.itemColor')} value={color} onChange={setColor} presets={RARITY_PRESETS} disabled={saving} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <NumberField
          label={t('case.itemWeight')}
          value={weight}
          onChange={setWeight}
          min={0}
          max={1000}
          step={0.5}
          hint={weight <= 0 ? t('case.weightZeroHint') : t('case.weightHint')}
          disabled={saving}
        />
        <Field label={t('case.itemChance')}>
          <div className="px-3 py-2 bg-page border border-edge clip-corner-btn">
            <span className="text-sm font-mono text-ink">{formatPercent(chance)}</span>
          </div>
        </Field>
      </div>
    </ModalShell>
  )
}
