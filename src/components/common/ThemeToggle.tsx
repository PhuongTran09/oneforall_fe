import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getTheme, type Theme } from '../../utils/theme'
import { toggleThemeWithWipe } from '../../utils/themeWipe'
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
      onClick={() => setTheme(toggleThemeWithWipe())}
      className="flex h-[30px] shrink-0 cursor-pointer items-center border border-edge bg-surface p-[3px] clip-corner-btn focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#ff3b30]"
    >
      {/* Ô trượt 2 nấc rộng đúng 2 lần knob nên dịch chuyển = translate-x-full,
          không phụ thuộc bề dày viền 3D của khung ngoài. */}
      <span className="relative block h-[24px] w-[48px]">
        <span
          aria-hidden="true"
          className={`theme-knob absolute top-0 left-0 grid h-[24px] w-[24px] place-items-center bg-brand-gradient text-white transition-transform duration-[220ms] ease-out motion-reduce:transition-none ${
            isLight ? '' : 'translate-x-full'
          }`}
        >
          {isLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </span>
      </span>
    </button>
  )
}
