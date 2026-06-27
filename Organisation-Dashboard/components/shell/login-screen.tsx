"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function LoginScreen() {
  const { signIn } = useAuth()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError(null)
    const err = await signIn(password)
    if (err) {
      setError(err)
      setBusy(false)
    }
    // Bei Erfolg übernimmt der AuthState-Wechsel das Umschalten der Ansicht.
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* Atmosphäre: weiche Orange-Glows + feines Raster */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vitaminb-orange.png" alt="vitaminb" className="h-12 w-auto" />
          <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Organisations-OS
          </div>
          <h1 className="mt-2 font-heading text-2xl font-bold">Team-Anmeldung</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gemeinsames Passwort eingeben, um auf das Dashboard zuzugreifen.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl"
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
                className="h-12 w-full rounded-xl border border-border bg-white/[0.03] pl-10 pr-3 text-base outline-none transition-colors focus:border-primary/60"
              />
            </div>
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-destructive"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!password || busy}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Anmelden
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          vitaminb kommunikation &amp; design · internes System
        </p>
      </motion.div>
    </div>
  )
}
