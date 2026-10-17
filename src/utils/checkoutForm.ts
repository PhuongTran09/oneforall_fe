/**
 * SePay ký HMAC lên bộ field checkout, trong đó có cả ba URL redirect, nên trang thanh
 * toán CHỈ mở được bằng POST form mang đúng bộ field đó — GET/redirect sẽ hỏng signature.
 * Form tự dựng và submit cùng tab: người dùng rời khỏi app, SePay trả về return_url.
 */
export function submitAutoCheckout(action: string, fields: Record<string, string>): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  // order_description mang tiếng Việt có dấu: charset phải khai báo để không đổi ký tự.
  form.acceptCharset = 'UTF-8'
  form.style.display = 'none'
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
  // Không remove form: trang sẽ unload ngay sau submit, và form ở lại là bằng chứng
  // khi debug. Nếu submit không rời trang (SePay chặn form POST), caller vẫn còn modal.
}
