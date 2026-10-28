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

/**
 * Nền hòm do người dùng chọn (có thể là #ffffff), nên chữ phải tính độ sáng tương đối
 * thay vì hardcode — nền sáng thì chữ tối, ngược lại chữ trắng.
 */
export function contrastInk(background: string): string {
  const [r, g, b] = channels(background).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? INK_DARK : INK_LIGHT
}
