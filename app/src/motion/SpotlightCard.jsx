import { useRef } from 'react'

// A warm radial glow that tracks the cursor over a card — pure CSS custom
// props (--mx/--my), consumed by the .spotlight::before gradient in styles.css.
export default function SpotlightCard({ children, className = '', as: Tag = 'div', ...props }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <Tag ref={ref} className={`spotlight ${className}`.trim()} onPointerMove={onMove} {...props}>
      {children}
    </Tag>
  )
}
