'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import type { InternalHref } from '@/i18n/routing'
import { Arrow } from '@/components/ui/Arrow'
import { LocaleSwitcher } from './LocaleSwitcher'

type Child = { href: InternalHref; label: string; tagline: string }

type Item = {
  href: InternalHref
  label: string
  children?: Child[]
}

type Props = {
  /** Desktop navigation. The small-screen menu adds the home page in front. */
  items: Item[]
  home: { href: InternalHref; label: string }
  labels: { primary: string; menuOpen: string; menuClose: string; phone: string }
  phones: { tel: string; display: string }[]
  /** Already uppercased on the server with the locale-aware helper. */
  place: string
}

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Primary navigation. A Client Component only because it needs the current
 * pathname for aria-current and state for the small-screen menu. Labels arrive
 * as props from the server header, so no message catalogue crosses over.
 */
export function SiteNav({ items, home, labels, phones, place }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'

    // Everything behind the menu leaves the tab order and the accessibility
    // tree while it is open; the header stays, so the close button is reachable.
    const behind = [document.getElementById('main'), document.querySelector('footer')].filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    )
    behind.forEach((el) => (el.inert = true))

    firstLink.current?.focus({ preventScroll: true })

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }

    // Widening past the breakpoint hides the menu, so it must also close it,
    // or the page would stay locked behind an invisible panel.
    const wide = window.matchMedia('(min-width: 64rem)')
    function onWide(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      root.style.overflow = previous
      behind.forEach((el) => (el.inert = false))
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  const close = () => setOpen(false)
  const rows: Item[] = [home, ...items]
  const childCount = rows.reduce((n, row) => n + (row.children?.length ?? 0), 0)

  return (
    <>
      {/* Label centre lines sit on the wordmark's centre line, not the lockup's. */}
      <nav aria-label={labels.primary} className="mt-[calc(var(--wordmark-mid)-0.9375rem)] hidden items-center lg:flex">
        <ul className="nav-rule flex items-center">
          {items.map((item) => (
            <li key={item.href} className="px-6">
              <Link
                href={item.href}
                aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                className="link-draw py-1 text-[0.9375rem] text-[var(--text-strong)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pl-6">
            <LocaleSwitcher className="link-draw py-1 text-[0.9375rem] text-[var(--text-link)]" />
          </li>
        </ul>
      </nav>

      <button
        ref={button}
        type="button"
        className="menu-toggle relative z-50 -mr-2 mt-[calc(var(--wordmark-mid)-1.5rem)] grid size-12 place-items-center lg:hidden"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? labels.menuClose : labels.menuOpen}</span>
        <span aria-hidden="true" className="menu-toggle-icon">
          <span />
          <span />
        </span>
      </button>

      <div
        id="site-menu"
        data-ground="void"
        data-open={open}
        inert={!open}
        className="menu-panel lg:hidden"
      >
        <div aria-hidden="true" className="menu-facade">
          <span className="menu-tower menu-tower--near" />
          <span className="menu-tower menu-tower--far" />
          <span className="menu-scrim" />
        </div>

        <div className="menu-scroll">
          <nav aria-label={labels.primary} className="shell flex min-h-full flex-col pb-8 pt-3">
            <ul>
              {rows.map((item, i) => {
                const current = isCurrent(pathname, item.href) && (item.href !== '/divisions' || pathname === item.href)
                return (
                  <li key={item.href} className="menu-row" style={order(i)}>
                    <Link
                      ref={i === 0 ? firstLink : undefined}
                      href={item.href}
                      onClick={close}
                      aria-current={current ? 'page' : undefined}
                      className="menu-link"
                    >
                      <span>{item.label}</span>
                      <Arrow className="menu-link-arrow" />
                    </Link>

                    {item.children ? (
                      <ul className="menu-sub">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={close}
                              aria-current={pathname === child.href ? 'page' : undefined}
                              className="menu-sublink"
                            >
                              <span className="menu-sublink-name">{child.label}</span>
                              <span className="menu-sublink-tagline">{child.tagline}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <span aria-hidden="true" className="menu-rule" />
                  </li>
                )
              })}
            </ul>

            <div className="menu-row menu-foot mt-auto pt-10" style={order(rows.length + childCount / 3)}>
              <p className="t-label">{labels.phone}</p>
              <ul className="mt-2">
                {phones.map((phone) => (
                  <li key={phone.tel}>
                    <a href={`tel:${phone.tel}`} className="menu-phone tabular">
                      {phone.display}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-5">
                <span className="text-[0.75rem] tracking-[0.08em] text-[var(--text-muted)]">{place}</span>
                <LocaleSwitcher className="btn btn--ghost min-h-11 px-5 py-2" />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
