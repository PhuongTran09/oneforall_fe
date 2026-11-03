




import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

;(globalThis as any).document = { documentElement: { lang: 'vi' } }
;(globalThis as any).localStorage = { store: {} as any, getItem(k: string) { return this.store[k] ?? null }, setItem(k: string, v: string) { this.store[k] = v } }

const { sanitizeUserMessage } = await import('../src/utils/apiError')
const { syncLangFromPath } = await import('../src/i18n/langStore')

syncLangFromPath('/en/x')
const lines = readFileSync(join(tmpdir(), 'be_vi_messages.txt'), 'utf8').split(/\r?\n/).filter(Boolean)
const mapped: string[] = []
const generic: string[] = []
for (const line of lines) {
  const [file, raw] = line.split('\t')


  const text = raw.replace(/^f?"/, '').replace(/"$/, '').replace(/\{[^{}]*\}/g, '10')
  const out = sanitizeUserMessage(text, '__MISS__')
  if (out === '__MISS__') generic.push(`${file}\t${text}`)
  else mapped.push(`${text.slice(0, 60)}\n     -> ${out}`)
}
console.log(`mapped ${mapped.length} / ${lines.length}`)
for (const m of mapped) console.log('  ' + m)
console.log(`\nchưa map (user EN nhận câu theo status) ${generic.length}:`)
for (const g of generic) console.log('  ' + g)
