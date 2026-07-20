import { useEffect, useState } from 'react'

// Kept in sync with the @media breakpoints in navbar/index.css and
// dashboard/index.css. Matches Bootstrap 4's md tier, which this app already
// uses for its grid.
export const MOBILE_BREAKPOINT = 768

const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`

// Tracks whether the viewport is below the mobile breakpoint.
//
// Layout lives in CSS; this exists only for the cases CSS can't express —
// swapping the SlidingPane to full width and rendering the drawer's back/close
// controls, both of which are props rather than styles.
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const mql = window.matchMedia(QUERY)
    const onChange = (event) => setIsMobile(event.matches)

    // Re-sync in case the viewport changed between first render and this effect.
    setIsMobile(mql.matches)

    // Safari below 14 only has the deprecated addListener/removeListener pair.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [])

  return isMobile
}
