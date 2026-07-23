import { useEffect, useRef } from 'react'
import gif from '../assets/ascii-magic-1.gif'

const MAX_DEG = 10
const EASE = 0.08

export function ParallaxBg() {
  const layerRef = useRef<HTMLDivElement>(null)
  const target = useRef({ rx: 0, ry: 0 })
  const current = useRef({ rx: 0, ry: 0 })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      target.current = { rx: -ny * MAX_DEG, ry: nx * MAX_DEG }
    }

    const recenter = () => {
      target.current = { rx: 0, ry: 0 }
    }

    const tick = () => {
      const c = current.current
      const t = target.current
      c.rx += (t.rx - c.rx) * EASE
      c.ry += (t.ry - c.ry) * EASE
      const el = layerRef.current
      if (el) {
        el.style.transform = `rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', recenter)
    window.addEventListener('blur', recenter)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', recenter)
      window.removeEventListener('blur', recenter)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="parallax-bg" aria-hidden>
      <div
        ref={layerRef}
        className="parallax-bg__layer"
        style={{ backgroundImage: `url(${gif})` }}
      />
      <div className="parallax-bg__veil" />
    </div>
  )
}
