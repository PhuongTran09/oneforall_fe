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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF3B30] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]'

    const variantStyles = {
      primary:
        'bg-brand-gradient text-white shadow-brand-sm hover:shadow-brand-md hover:brightness-105 border-0',
      secondary:
        'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs',
      outline:
        'bg-transparent text-[#FF3B30] border border-[#FF3B30]/40 hover:bg-[#FF3B30]/5 hover:border-[#FF3B30]',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent',
      glow:
        'bg-brand-gradient text-white shadow-brand-md hover:shadow-brand-lg hover:brightness-105 font-semibold',
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
