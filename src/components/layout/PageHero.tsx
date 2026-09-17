import type { CSSProperties, ReactNode } from 'react'
import { Facade } from '@/components/facade/Facade'
import type { FacadeName } from '@/components/facade/geometry'

type Props = {
  /** Unique on the page; namespaces the facade's gradient ids. */
  id: string
  facade: FacadeName
  title: ReactNode
  intro?: ReactNode
  actions?: ReactNode
  /** Run the near tower's lit edge through the fold of the header logo. */
  anchor?: boolean
  /** Lit panes jump along the floors and columns of the building. */
  runners?: boolean
  /** full: the home page. tall: section landings. compact: reading pages. */
  size?: 'full' | 'tall' | 'compact'
  /** Content ruled off along the foot of the band, under the headline. */
  foot?: ReactNode
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
 * the seam, the headline rises, the rules draw.
 */
export function PageHero({
  id,
  facade,
  title,
  intro,
  actions,
  anchor = false,
  runners = false,
  size = 'tall',
  foot,
}: Props) {
  const hasAside = Boolean(intro || actions)

  return (
    <section data-ground="navy" className={`band flex flex-col overflow-hidden ${heights[size]}`}>
      <Facade
        id={id}
        name={facade}
        intro
        anchor={anchor}
        runners={runners}
        scrim={size === 'compact' ? 'bottom' : 'left'}
        quiet={size === 'compact'}
      />

      <div className="shell flex flex-1 flex-col pt-[calc(var(--header-height)+2.5rem)]">
        <div className={`flex flex-1 flex-col justify-end ${foot ? 'pb-14 lg:pb-20' : 'pb-16 lg:pb-24'}`}>
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

        {foot ? (
          <div className="pb-10 lg:pb-14">
            <span aria-hidden="true" className="rule-h draw-x" style={delay(600)} />
            <div className="rise pt-8 md:pt-10" style={delay(700)}>
              {foot}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
