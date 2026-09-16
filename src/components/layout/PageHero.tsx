import type { CSSProperties, ReactNode } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { Facade } from '@/components/facade/Facade'
import type { FacadeName } from '@/components/facade/geometry'
import { ORG } from '@/lib/site'
import { upper } from '@/lib/text'

type Props = {
  /** Unique on the page; namespaces the facade's gradient ids. */
  id: string
  facade: FacadeName
  title: ReactNode
  intro?: ReactNode
  actions?: ReactNode
  /** Run the near tower's lit edge through the fold of the header logo. */
  anchor?: boolean
  /** full: the home page. tall: section landings. compact: reading pages. */
  size?: 'full' | 'tall' | 'compact'
  plaque?: boolean
}

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

const heights = {
  full: 'min-h-[max(100svh,44rem)]',
  tall: 'min-h-[max(78svh,38rem)]',
  compact: 'min-h-[26rem]',
}

/**
 * The navy facade band every page opens with. The header floats over it, so
 * the top padding clears the header height.
 *
 * Its entrance is CSS only and plays on first paint: the towers slide along
 * the seam, the headline rises, the rule draws down, the plaque rules across.
 */
export async function PageHero({
  id,
  facade,
  title,
  intro,
  actions,
  anchor = false,
  size = 'tall',
  plaque = false,
}: Props) {
  const hasAside = Boolean(intro || actions)

  return (
    <section data-ground="navy" className={`band flex flex-col overflow-hidden ${heights[size]}`}>
      <Facade
        id={id}
        name={facade}
        intro
        anchor={anchor}
        scrim={size === 'compact' ? 'bottom' : 'left'}
        quiet={size === 'compact'}
      />

      <div className="shell flex flex-1 flex-col pt-[calc(var(--header-height)+2.5rem)]">
        <div
          className={`flex flex-1 flex-col justify-end ${plaque ? 'pb-12 lg:pb-16' : 'pb-16 lg:pb-24'}`}
        >
          <div className="grid gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-x-8">
            <h1 className={`t-display-xl rise ${hasAside ? 'lg:col-span-7' : 'lg:col-span-10'}`} style={delay(120)}>
              {title}
            </h1>

            {hasAside ? (
              <div className="relative lg:col-span-5 lg:col-start-8 lg:pl-12 xl:col-span-4 xl:col-start-9">
                <span aria-hidden="true" className="rule-v draw-y hidden lg:block" style={delay(520)} />
                {intro ? (
                  <div className="t-lead rise max-w-[46ch]" style={delay(380)}>
                    {intro}
                  </div>
                ) : null}
                {actions ? (
                  <div className="rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-5" style={delay(560)}>
                    {actions}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {plaque ? <Plaque /> : null}
      </div>
    </section>
  )
}

/**
 * The registered identity along the foot of the home hero, the way a tower
 * lobby carries its occupant's plaque. For a visitor checking whether this is
 * a real company, it is the first answer, before any scrolling.
 *
 * Every item is uppercased at render time with the locale-aware helper, never
 * with text-transform, which breaks the Turkish dotted capital outside Firefox.
 */
async function Plaque() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('Home')
  const c = await getTranslations('Company')

  return (
    <div className="pb-6">
      <span aria-hidden="true" className="rule-h draw-x" style={delay(700)} />
      <ul className="plaque rise pt-5" style={delay(820)}>
        <li>{ORG.legalName}</li>
        <li className="hidden md:block">{upper(t('eyebrow'), locale)}</li>
        <li className="hidden sm:block">{upper(`${ORG.address.district} / ${ORG.address.city}`, locale)}</li>
        <li className="tabular hidden lg:block">
          {upper(c('taxId'), locale)} {ORG.taxId}
        </li>
      </ul>
    </div>
  )
}
