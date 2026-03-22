"use client"

import { motion, useInView, animate } from "framer-motion"
import { useRef, useEffect, useState } from "react"

const stats = [
  { value: 50, suffix: "+", label: "Zufriedene Kunden" },
  { value: 120, suffix: "+", label: "Abgeschlossene Projekte" },
  { value: 8, suffix: "+", label: "Jahre Erfahrung" },
  { value: 100, suffix: "%", label: "Weiterempfehlungsrate" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: [0.25, 0.1, 0.25, 1],
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      })
      return () => controls.stop()
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="text-5xl md:text-6xl font-bold gradient-text tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
}

export function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6a00]/20 to-transparent origin-center"
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6a00]/20 to-transparent origin-center"
      />

      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center group"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "40px" } : {}}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.6 }}
                className="h-[1px] bg-[#ff6a00]/30 mx-auto mt-3 mb-2"
              />
              <div className="text-white/40 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
