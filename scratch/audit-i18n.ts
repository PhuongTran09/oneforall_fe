// Audit i18n + đường lỗi FE. Chạy:
//   npx esbuild scratch/audit-i18n.ts --bundle --platform=node --format=cjs --outfile=scratch/audit.cjs \
//     --define:import.meta.env='{"DEV":false}' && node scratch/audit.cjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { vi } from '../src/i18n/dict.vi'
import { en } from '../src/i18n/dict.en'

const SRC = join(process.cwd(), 'src')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return /\.(ts|tsx)$/.test(p) ? [p] : []
  })
}

function flat(obj: unknown, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out.set(key, v)
    else if (v && typeof v === 'object') for (const [a, b] of flat(v, key)) out.set(a, b)
  }
  return out
}

const viKeys = flat(vi)
const enKeys = flat(en)
const files = walk(SRC)

const used = new Map<string, string[]>()
const dynamic: string[] = []
for (const f of files) {
  const text = readFileSync(f, 'utf8')
  const rel = relative(SRC, f).replace(/\\/g, '/')
  for (const m of text.matchAll(/\bt\(\s*'([a-zA-Z][\w.]*)'\s*[,)]/g)) {
    used.set(m[1], [...(used.get(m[1]) ?? []), rel])
  }
  for (const m of text.matchAll(/\bt\(\s*`([^`]*)`/g)) {
    if (m[1].includes('${')) dynamic.push(`${rel}: t(\`${m[1]}\`)`)
  }
}

const placeholders = (s: string) => new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))
const diffSets = (a: Set<string>, b: Set<string>) => [...a].filter((x) => !b.has(x))

console.log(`files=${files.length} viKeys=${viKeys.size} enKeys=${enKeys.size} usedStatic=${used.size}`)

const missingVi = [...used.keys()].filter((k) => !viKeys.has(k))
const missingEn = [...used.keys()].filter((k) => viKeys.has(k) && !enKeys.has(k))
console.log(`\n[1] key DÙNG mà dict VI KHÔNG có (${missingVi.length}):`)
for (const k of missingVi) console.log(`   ${k} <- ${used.get(k)!.join(', ')}`)
console.log(`[2] key DÙNG, VI có mà EN thiếu (${missingEn.length}):`)
for (const k of missingEn) console.log(`   ${k} <- ${used.get(k)!.join(', ')}`)

const onlyVi = diffSets(new Set(viKeys.keys()), new Set(enKeys.keys()))
const onlyEn = diffSets(new Set(enKeys.keys()), new Set(viKeys.keys()))
console.log(`[3] key chỉ có ở VI (${onlyVi.length}): ${onlyVi.join(', ') || '-'}`)
console.log(`    key chỉ có ở EN (${onlyEn.length}): ${onlyEn.join(', ') || '-'}`)

const phMismatch: string[] = []
for (const k of viKeys.keys()) {
  if (!enKeys.has(k)) continue
  const a = diffSets(placeholders(viKeys.get(k)!), placeholders(enKeys.get(k)!))
  const b = diffSets(placeholders(enKeys.get(k)!), placeholders(viKeys.get(k)!))
  if (a.length || b.length) phMismatch.push(`   ${k}: VI{${[...placeholders(viKeys.get(k)!)].join(',')}} vs EN{${[...placeholders(enKeys.get(k)!)].join(',')}}`)
}
console.log(`\n[4] placeholder VI/EN lệch nhau (${phMismatch.length}):`)
for (const line of phMismatch) console.log(line)

const unused = [...viKeys.keys()].filter((k) => !used.has(k))
console.log(`\n[5] key trong dict mà KHÔNG file nào gọi tĩnh (${unused.length}):`)
for (const k of unused) console.log(`   ${k}`)

console.log(`\n[6] chỗ gọi t() động (key ghép lúc chạy):`)
for (const d of dynamic) console.log(`   ${d}`)

// [7] Text thừa: khoảng trắng kép, thiếu dấu cách trước câu tiếp, ký tự điều khiển.
console.log(`\n[7] chuỗi nghi vấn (double space / thiếu space / control char):`)
for (const [k, v] of [...viKeys, ...[...enKeys].map((x): [string, string] => [`en:${x[0]}`, x[1]])]) {
  const hits: string[] = []
  if (/  /.test(v)) hits.push('double-space')
  if (/[a-zà-ỹ][A-ZÀ-Ỹ]/.test(v)) hits.push('missing-space')
  if (/\t|\n/.test(v)) hits.push('control-char')
  if (hits.length) console.log(`   ${k}: ${hits.join(',')} :: ${JSON.stringify(v.slice(0, 90))}`)
}

// [8] Job type/queue label coverage: BE trả type nào, dict có tương ứng không.
const beTypes = ['convert_file', 'image_process', 'video_process', 'media_process', 'background_removal']
const historyBlock = (vi as { history?: Record<string, unknown> }).history
console.log(`\n[8] job type BE vs dict.history keys: ${Object.keys(historyBlock ?? {}).slice(0, 20).join(', ')}`)
for (const tpe of beTypes) if (!(tpe in (historyBlock ?? {}))) console.log(`   thiếu label cho ${tpe}`)
if (existsSync(join(SRC, 'features'))) console.log('')
