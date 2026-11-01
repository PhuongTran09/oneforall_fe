import type { ReactNode } from 'react'

export interface SplitWorkspaceProps {
  /** Cột trái (lớn): danh sách nội dung cuộn tự do. */
  content: ReactNode
  /** Cột phải (nhỏ): TaskStatusWidget — thứ gì đó ngắn hơn một màn hình. */
  panel: ReactNode
}

/**
 * Hai cột, cột phải ghim chặt khi cột trái còn cuộn.
 *
 * Ba điều kiện để `sticky` sống; thiếu một cái là nó im lặng không ghim, không báo lỗi:
 *  - `items-start`: grid mặc định stretch, cột phải bị kéo cao bằng cột trái → hết chỗ
 *    để dính. sticky chỉ bám trong khoảng trống giữa chỗ nó đứng và đáy hộp chứa.
 *  - không có tổ tiên `overflow-hidden|auto|clip`: sticky tính theo "kẻ cuộn gần nhất",
 *    một hộp overflow-hidden biến nó thành kẻ cuộn và chốt luôn tại chỗ.
 *  - `max-h` + `overflow-y-auto` cho riêng cột phải: danh sách job dài hơn màn hình thì
 *    cuộn trong nó, đừng để cột cao 3000px làm sticky mất chỗ bám. `data-lenis-prevent`
 *    để bánh xe trong vùng đó không kéo cả trang (xem SmoothScrollProvider).
 *
 * Chỉ ghim từ `lg`: màn 375px mà ghim bảng tiến trình là ăn mất nửa màn hình đúng chỗ
 * người dùng đang thao tác. class `.workspace-panel` để index.css né
 * `content-visibility: auto` của section — cùng cái bẫy mà [data-pin] đã phải né.
 */
export function SplitWorkspace({ content, panel }: SplitWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">{content}</div>
      <aside
        data-lenis-prevent
        className="workspace-panel lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:scrollbar-none"
      >
        {panel}
      </aside>
    </div>
  )
}
