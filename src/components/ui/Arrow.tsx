/** The one arrow on the site. Drawn at a hairline weight to match the facade. */
export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 12" className={className} aria-hidden="true" focusable="false" fill="none">
      <path d="M0 6h20.5M15 .75 20.5 6 15 11.25" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
