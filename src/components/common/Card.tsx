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
  // lift/hover effects come from .card-3d in index.css — no Tailwind transform here
  const baseStyles = 'relative bg-surface card-3d'
  const borderStyles = bordered ? 'border border-[rgba(255,59,48,0.25)]' : ''
  // caller may override the clip size (clip-corner-card and clip-corner-lg both set clip-path)
  const clipStyles = className.includes('clip-corner') ? '' : 'clip-corner-card'
  const hoverStyles = hoverEffect ? 'hover:border-[rgba(255,59,48,0.55)]' : ''

  return (
    <div className={`${baseStyles} ${borderStyles} ${clipStyles} ${hoverStyles} ${className}`} {...props}>
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
    <h3 className={`text-lg font-bold text-ink tracking-tight ${className}`} {...props}>
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
