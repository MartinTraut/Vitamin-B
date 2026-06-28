"use client"

// Animierter, mehrfarbiger Aurora-Hintergrund in der Identitaet der aktiven
// Person. Statt einer flachen Farbe nutzt jede Person eine harmonische
// 3-Ton-Palette; per Screen-Blend ueberlagern sich die Toene zu sattem
// Leuchten auf dem dunklen Grund. Ein langsam rotierendes Mehrfarb-Feld plus
// atmende Blobs halten die Flaeche dezent in Bewegung. Beim Personenwechsel
// faerbt alles per Crossfade weich um. Liegt hinter allen (halbtransparenten)
// Flaechen → in jedem Bereich sichtbar.
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useStore } from "@/lib/store"
import { PEOPLE } from "@/lib/types"

// Eine klar DOMINANTE Leitfarbe je Person + ein verwandter Akzent (gleiche
// Farbfamilie, damit nichts grau ausmischt). Bewusst weit auseinander auf dem
// Farbkreis gewaehlt, damit die drei Profile eindeutig unterscheidbar sind:
// Robert warm-orange · Bastian kuehl-blau · Martin magenta-violett.
const AURA_PALETTE: Record<string, [string, string]> = {
  robert: ["#F59016", "#FFC24D"], // Orange → Gold
  bastian: ["#2E7BFF", "#37D6F0"], // Blau → Cyan
  martin: ["#C13AF5", "#F25CC1"], // Violett → Magenta
}

export function PersonAura() {
  const { activePerson } = useStore()
  const reduce = useReducedMotion()
  const person = PEOPLE.find((p) => p.id === activePerson) ?? PEOPLE[0]
  const [c0, c1] = AURA_PALETTE[person.id] ?? [person.color, person.color]

  const loop = (v: Record<string, number[]>, duration: number) =>
    reduce ? undefined : { ...v, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <AnimatePresence mode="sync">
        <motion.div
          key={person.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Grund-Wash (normal) — sichert Grundton in jeder Ecke */}
          <div className="absolute inset-0" style={{ background: `${c0}12` }} />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(135% 110% at 50% -8%, ${c0}33, transparent 62%)` }}
          />

          {/* Leucht-Ebene: Screen-Blend laesst Toene satt ineinander gluehen */}
          <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
            {/* Langsam rotierendes Mehrfarb-Feld */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
              style={{
                background: `conic-gradient(from 0deg, ${c0}4a, ${c1}24, ${c0}3a, ${c1}1c, ${c0}4a)`,
              }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={reduce ? undefined : { duration: 95, repeat: Infinity, ease: "linear" }}
            />

            {/* Atmende, driftende Blobs — Leitfarbe dominiert, Akzent stuetzt */}
            <motion.div
              className="absolute -left-[14%] -top-[16%] h-[72vh] w-[72vh] rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${c0}82, transparent 70%)` }}
              animate={loop({ x: [0, 50, -26, 0], y: [0, 36, 58, 0], scale: [1, 1.18, 1.07, 1], opacity: [0.85, 1, 0.78, 0.85] }, 24)}
            />
            <motion.div
              className="absolute -right-[14%] top-[10%] h-[66vh] w-[66vh] rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${c1}5e, transparent 70%)` }}
              animate={loop({ x: [0, -58, 28, 0], y: [0, 48, -26, 0], scale: [1, 1.14, 1.26, 1], opacity: [0.8, 0.95, 0.7, 0.8] }, 30)}
            />
            <motion.div
              className="absolute -bottom-[18%] left-[26%] h-[62vh] w-[62vh] rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${c0}6e, transparent 70%)` }}
              animate={loop({ x: [0, 38, -38, 0], y: [0, -38, 16, 0], scale: [1, 1.2, 1, 1], opacity: [0.85, 0.72, 1, 0.85] }, 36)}
            />
            {/* Zusatz-Blob links unten — Farbe im Sidebar-Bereich */}
            <motion.div
              className="absolute bottom-[4%] -left-[10%] h-[50vh] w-[50vh] rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${c1}4d, transparent 70%)` }}
              animate={loop({ x: [0, 30, -16, 0], y: [0, -24, 20, 0], scale: [1, 1.16, 1.04, 1], opacity: [0.75, 1, 0.8, 0.75] }, 28)}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
