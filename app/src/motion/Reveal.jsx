import { motion, useReducedMotion } from 'framer-motion'

// Blur-to-sharp + rise reveal. `delay` sequences staggered text; honors
// reduced-motion by rendering a static node.
export default function Reveal({ children, delay = 0, y = 14, className, style }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className} style={style}>{children}</div>
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
