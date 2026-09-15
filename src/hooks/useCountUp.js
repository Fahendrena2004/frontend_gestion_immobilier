import { useEffect, useRef, useState } from 'react'

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Animates a number from 0 (or previous target) to `target` using
 * requestAnimationFrame. Returns the current displayed value.
 *
 * @param {number}  target   - The value to count up to.
 * @param {number}  duration - Animation duration in ms (default 1200).
 * @param {boolean} enabled  - Start counting only when true (e.g. isInView).
 * @returns {number} The current displayed value (integer).
 */
export default function useCountUp(target, { duration = 1200, enabled = false } = {}) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    // If user prefers reduced motion, skip animation entirely.
    if (reducedMotion) {
      setDisplay(target)
      return
    }

    // Cancel any running animation before starting a new one.
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    fromRef.current = display
    startRef.current = null

    function tick(now) {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(fromRef.current + (target - fromRef.current) * eased)
      setDisplay(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, enabled, duration])

  return display
}
