import type { ComponentProps, ReactNode } from 'react'
import { Link } from '@/i18n/navigation'

type Variant = 'solid' | 'outline' | 'quiet'

const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors duration-[--duration-fast] ease-[--ease-brand]'

// radius 0 throughout: the brand mark is all straight edges and one hard fold,
// so a rounded button would be the only soft shape on the page.
const variants: Record<Variant, string> = {
  solid: 'bg-brand-600 text-paper-50 hover:bg-brand-700',
  outline:
    'border border-[var(--border-strong)] text-[var(--text-strong)] hover:bg-[var(--surface-sunken)]',
  quiet: 'text-[var(--text-link)] hover:underline underline-offset-4 px-0 py-0',
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }

export function ButtonLink({ variant = 'solid', className = '', children, ...rest }: LinkProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
