import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to false for SSR
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  // Track if component is mounted
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Only run on client-side
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }

      // Set initial value
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

      // Add event listener
      mql.addEventListener("change", onChange)

      // Cleanup
      return () => mql.removeEventListener("change", onChange)
    }
  }, [])

  // Return false during SSR, actual value after mount
  return mounted ? isMobile : false
}
