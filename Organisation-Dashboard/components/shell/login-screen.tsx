"use client"

import { useState } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion"
import { Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth"
import DotField from "./dot-field"

const ACCENT = "#E39832"

// Choreografie: Inhalte gestaffelt einblenden.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const rise = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  },
}

export function LoginScreen() {
  const { signIn } = useAuth()
  const reduce = useReducedMotion()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)

  // Maus-reaktiver Glanz + leichter 3D-Tilt der Karte.
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const sx = useSpring(mx, { stiffness: 120, damping: 20 })
  const sy = useSpring(my, { stiffness: 120, damping: 20 })
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotX = useSpring(rx, { stiffness: 150, damping: 18 })
  const rotY = useSpring(ry, { stiffness: 150, damping: 18 })
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${sx}% ${sy}%, ${ACCENT}1f, transparent 65%)`

  function onCardMove(e: React.MouseEvent<HTMLFormElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    mx.set(x * 100)
    my.set(y * 100)
    ry.set((x - 0.5) * 8)
    rx.set((0.5 - y) * 8)
  }
  function onCardLeave() {
    rx.set(0)
    ry.set(0)
    mx.set(50)
    my.set(50)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError(null)
    const err = await signIn(password)
    if (err) {
      setError(err)
      setBusy(false)
      setShake((s) => s + 1)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* Interaktives Dot-Feld */}
      <div className="absolute inset-0">
        <DotField />
      </div>

      {/* Aurora-Glows, langsam driftend */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full"
        style={{ background: ACCENT, filter: "blur(140px)", opacity: 0.16 }}
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full"
        style={{ background: ACCENT, filter: "blur(150px)", opacity: 0.1 }}
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette für Tiefe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
        style={{ perspective: 1200 }}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Logo mit pulsierendem Glow */}
          <motion.div variants={rise} className="relative">
            <motion.span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full"
              style={{ background: ACCENT, filter: "blur(34px)" }}
              animate={reduce ? undefined : { opacity: [0.25, 0.5, 0.25], scale: [0.9, 1.08, 0.9] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-vitaminb-orange.png" alt="vitaminb" className="h-12 w-auto" />
          </motion.div>

          <motion.div variants={rise} className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Organisations-OS
          </motion.div>
          <motion.h1 variants={rise} className="mt-2 font-heading text-[clamp(1.4rem,5vw+0.5rem,1.7rem)] font-bold leading-tight">
            Team-Anmeldung
          </motion.h1>
          <motion.p variants={rise} className="mt-2 max-w-xs text-sm text-muted-foreground">
            Gemeinsames Passwort eingeben, um auf das Dashboard zuzugreifen.
          </motion.p>
        </div>

        <motion.form
          variants={rise}
          onSubmit={submit}
          onMouseMove={onCardMove}
          onMouseLeave={onCardLeave}
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-6 shadow-2xl backdrop-blur-2xl"
        >
          {/* Maus-reaktiver Glanz auf der Karte */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glowBg }}
          />
          {/* Animierter Rahmen-Schimmer oben */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}aa, transparent)` }}
          />

          <motion.div
            key={shake}
            animate={shake ? { x: [0, -9, 9, -6, 6, 0] } : undefined}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Team-Passwort</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border bg-white/[0.03] pl-10 pr-3 text-base outline-none transition-all focus:border-primary/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(227,152,50,0.15)]"
                />
              </div>
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm font-medium text-destructive"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={!password || busy}
              className="relative mt-5 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Shimmer-Sweep */}
              {!reduce && !busy && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)" }}
                  animate={{ x: ["-130%", "130%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Anmelden
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </motion.form>

        <motion.div
          variants={rise}
          className="mt-6 flex flex-col items-center gap-1.5 text-center"
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Ende-zu-Ende geschützt · nur fürs Team
          </span>
          <span className="text-xs text-muted-foreground/70">vitaminb kommunikation &amp; design · internes System</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
