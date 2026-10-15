import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getTheme, toggleTheme, type Theme } from '../../utils/theme'
import { t } from '../../i18n/langStore'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme)
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? t('theme.toDark') : t('theme.toLight')}
      onClick={() => setTheme(toggleTheme())}
      className="theme-toggle clip-corner-btn shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4545]/60"
    >
      <span className="theme-thumb" aria-hidden="true">
        {isLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </span>
    </button>
  )
}
