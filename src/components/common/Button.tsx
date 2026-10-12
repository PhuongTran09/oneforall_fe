import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] focus-visible:ring-[#FF3B30] disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const variantStyles = {
      primary:
        'bg-brand-gradient text-white hover:brightness-110 border-0 btn-3d clip-corner-btn',
      secondary:
        'bg-surface text-slate-200 border border-[rgba(255,59,48,0.35)] hover:bg-[#ff3b30]/5 hover:border-[rgba(255,59,48,0.6)] clip-corner-btn',
      outline:
        'bg-transparent text-[#FF3B30] border border-[#FF3B30]/50 hover:bg-[#FF3B30]/5 hover:border-[#FF3B30] clip-corner-btn',
      ghost:
        'bg-transparent text-slate-300 hover:bg-[#ff3b30]/10 hover:text-ink border-transparent clip-corner-btn',
      glow:
        'bg-brand-gradient text-white hover:brightness-110 font-semibold btn-3d clip-corner-btn',
    }

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    }

    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    )
  },
)

Button.displayName = 'Button'
