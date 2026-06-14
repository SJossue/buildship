import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion'
import { PLACEHOLDER } from '../assets.js'

// The proof — original ⇄ restyled wipe. Sacred component (design 05): same
// windows, same walls, your decor. Pointer-driven core, plus an intro wipe
// that reveals the restyle, and an in-place cross-fade when the restyled
// layer changes (the "flip to the other taste" morph).
export default function CompareSlider({ original, restyled, restyledLabel = 'Your style' }) {
  const [pos, setPos] = useState(50)
  const ref = useRef(null)
  const dragging = useRef(false)
  const reduce = useReducedMotion()

  // Intro wipe: sweep the divider open so the restyle reveals itself, then
  // settle. Runs on mount (the component remounts per room via its key).
  useEffect(() => {
    if (reduce) { setPos(50); return }
    const controls = animate(8, 52, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (!dragging.current) setPos(v) },
    })
    return () => controls.stop()
  }, [reduce])

  const moveTo = (clientX) => {
    const rect = ref.current.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <div
      className="compare"
      ref={ref}
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        moveTo(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => { dragging.current = false }}
    >
      <img
        src={original}
        alt="Original room"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER('original photo', 'left') }}
      />
      {/* restyled layer cross-fades when the taste flips */}
      <AnimatePresence>
        <motion.img
          key={restyled}
          src={restyled}
          alt="Restyled room"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER('restyle landing soon', 'right') }}
        />
      </AnimatePresence>
      <div className="divider" style={{ left: `${pos}%` }} />
      <div className="handle" style={{ left: `${pos}%` }} aria-hidden>
        <span className="handle-arrows">⇆</span>
      </div>
      <div className="tag left eyebrow">Original</div>
      <div className="tag right eyebrow">{restyledLabel}</div>
    </div>
  )
}
