const THIS_YEAR = new Date().getFullYear()

/**
 * Mốc thời gian gọn cho danh sách lịch sử: cùng năm thì chỉ ngày + giờ,
 * khác năm mới hiện cả năm vì bản ghi có thể đã rất cũ.
 */
export function formatStamp(at: number, lang: string): string {
  const date = new Date(at)
  const day = new Intl.DateTimeFormat(lang,
    date.getFullYear() === THIS_YEAR ? { day: '2-digit', month: '2-digit' } : { dateStyle: 'medium' },
  )
  const time = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' })
  return `${day.format(date)} ${time.format(date)}`
}
