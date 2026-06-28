"use client"

// Dezenter, animierter Hintergrund in der Farbe der aktiven Person.
// Signalisiert app-weit, in wessen Profil man sich befindet — beim
// Personenwechsel faerbt die Aura per Crossfade weich um.
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
          {/* Farbschleier oben — toent die Topbar-Zone */}
          <div
            className="absolute inset-x-0 top-0 h-[42vh]"
            style={{ background: `radial-gradient(120% 80% at 50% 0%, ${c}16, transparent 70%)` }}
          />
          {/* Drei langsam wandernde Glow-Blobs */}
          <motion.div
            className="absolute -left-[12%] -top-[15%] h-[58vh] w-[58vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}29, transparent 70%)` }}
            animate={drift([0, 44, -22, 0], [0, 30, 52, 0], [1, 1.16, 1.06, 1], 28)}
          />
          <motion.div
            className="absolute -right-[12%] top-[18%] h-[52vh] w-[52vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}1f, transparent 70%)` }}
            animate={drift([0, -52, 24, 0], [0, 42, -22, 0], [1, 1.1, 1.22, 1], 34)}
          />
          <motion.div
            className="absolute -bottom-[15%] left-[28%] h-[48vh] w-[48vh] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${c}1a, transparent 70%)` }}
            animate={drift([0, 32, -32, 0], [0, -32, 12, 0], [1, 1.18, 1, 1], 40)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
