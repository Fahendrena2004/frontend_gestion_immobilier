import { useEffect, useRef, useState } from 'react'

/**
 * Detects when a DOM element enters the viewport using IntersectionObserver.
 *
 * @param {Object} options
 * @param {number}  options.threshold   - Visibility ratio to trigger (0-1). Default 0.
 * @param {boolean} options.triggerOnce - If true, once `isInView` becomes true it stays true.
 * @param {string}  options.rootMargin - Observer root margin. Default "0px".
 * @returns {{ ref: React.RefObject, isInView: boolean }}
 */
export default function useInView({ threshold = 0, triggerOnce = true, rootMargin = '0px' } = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If the element is already visible at mount (e.g. hero content),
    // IntersectionObserver fires the callback synchronously in many
    // browsers, but to be safe we do an explicit initial check.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsInView(true)
      if (triggerOnce) return () => {}
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) observer.unobserve(el)
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, triggerOnce, rootMargin])

  return { ref, isInView }
}
