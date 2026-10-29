const INK_DARK = '#18181b'
const INK_LIGHT = '#f4f4f6'
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function channels(hex: string): [number, number, number] {
  const value = HEX.test(hex) ? hex : '#000000'
  const digits = value.slice(1)
  const full = digits.length === 3 ? digits.split('').map((c) => c + c).join('') : digits
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Nền hòm do người dùng chọn (có thể là #ffffff), nên chữ phải tính độ sáng tương đối
 * thay vì hardcode — nền sáng thì chữ tối, ngược lại chữ trắng.
 */
export function contrastInk(background: string): string {
  return luminance(background) > 0.45 ? INK_DARK : INK_LIGHT
}

function mixToward(hex: string, target: string, amount: number): string {
  const from = channels(hex)
  const to = channels(target)
  return `#${from
    .map((c, i) => Math.round(c + (to[i] - c) * amount))
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * Chip chữ cỡ nhỏ (tên độ hiếm) thì "tạm đọc được" là chưa đủ: màu độ hiếm giữa dải
 * như #34c759 chỉ đạt ~2:1 với cả chữ đen lẫn chữ trắng. Chọn mực tốt hơn rồi kéo nền
 * về phía đen/trắng cho tới khi đạt AA 4.5:1, vẫn giữ sắc của độ hiếm đó.
 */
export function chipInk(color: string): { background: string; ink: string } {
  const ink = contrast(color, INK_LIGHT) >= contrast(color, INK_DARK) ? INK_LIGHT : INK_DARK
  let background = color
  for (let step = 0; step < 10 && contrast(background, ink) < 4.5; step += 1) {
    background = mixToward(background, ink === INK_LIGHT ? '#000000' : '#ffffff', 0.16)
  }
  return { background, ink }
}
