
export function submitAutoCheckout(action: string, fields: Record<string, string>): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action

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


}
