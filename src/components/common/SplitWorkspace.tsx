import type { ReactNode } from 'react'

export interface SplitWorkspaceProps {

  content: ReactNode

  panel: ReactNode
}

















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
