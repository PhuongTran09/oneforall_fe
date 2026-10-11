import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  bordered?: boolean
  children: ReactNode
}

export function Card({
  hoverEffect = true,
  bordered = true,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'relative bg-[#14141b] transition-all duration-300 card-3d clip-corner-card'
  const borderStyles = bordered ? 'border border-[rgba(255,59,48,0.25)]' : ''
  const hoverStyles = hoverEffect
    ? 'hover:border-[rgba(255,59,48,0.55)] hover:-translate-y-0.5'
    : ''

  return (
    <div className={`${baseStyles} ${borderStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-bold text-white tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`mt-1.5 text-sm text-slate-400 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-3 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 flex items-center ${className}`} {...props}>
      {children}
    </div>
  )
}
