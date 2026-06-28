"use client"

// Animierter Hintergrund in der Farbe der aktiven Person.
// Signalisiert app-weit und deutlich, in wessen Profil man sich befindet —
// beim Personenwechsel faerbt die Aura per Crossfade weich um. Liegt hinter
// allen (halbtransparenten) Flaechen, daher in jedem Bereich sichtbar.
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useStore } from "@/lib/store"
import { PEOPLE } from "@/lib/types"

export function PersonAura() {
  const { activePerson } = useStore()
  const reduce = useReducedMotion()
  const person = PEOPLE.find((p) => p.id === activePerson) ?? PEOPLE[0]
  const c = person.color

  // Driftende Blobs — bei reduzierter Bewegung statisch.
  const drift = (x: number[], y: number[], s: number[], duration: number) =>
    reduce ? undefined : { x, y, scale: s, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <AnimatePresence mode="sync">
        <motion.div
          key={c}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Grund-Wash ueber die ganze Flaeche, damit kein Bereich neutral bleibt */}
          <div className="absolute inset-0" style={{ background: `${c}12` }} />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(135% 110% at 50% -10%, ${c}3a, transparent 60%)` }}
          />
          {/* Farbschleier oben — toent Topbar-Zone kraeftig */}
          <div
            className="absolute inset-x-0 top-0 h-[46vh]"
            style={{ background: `radial-gradient(120% 90% at 50% 0%, ${c}40, transparent 72%)` }}
          />
          {/* Grosse, langsam wandernde Glow-Blobs — decken alle Ecken inkl. Sidebar ab */}
          <motion.div
            className="absolute -left-[14%] -top-[16%] h-[70vh] w-[70vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}66, transparent 70%)` }}
            animate={drift([0, 48, -24, 0], [0, 34, 56, 0], [1, 1.18, 1.07, 1], 26)}
          />
          <motion.div
            className="absolute -right-[14%] top-[12%] h-[64vh] w-[64vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}55, transparent 70%)` }}
            animate={drift([0, -56, 26, 0], [0, 46, -24, 0], [1, 1.12, 1.24, 1], 32)}
          />
          <motion.div
            className="absolute -bottom-[18%] left-[24%] h-[60vh] w-[60vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}4d, transparent 70%)` }}
            animate={drift([0, 36, -36, 0], [0, -36, 14, 0], [1, 1.2, 1, 1], 38)}
          />
          {/* Zusatz-Blob links unten — sorgt fuer Farbe im Sidebar-Bereich */}
          <motion.div
            className="absolute bottom-[6%] -left-[10%] h-[48vh] w-[48vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}40, transparent 70%)` }}
            animate={drift([0, 28, -14, 0], [0, -22, 18, 0], [1, 1.14, 1.04, 1], 30)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
