"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronsUpDown } from "lucide-react"
import { useStore } from "@/lib/store"
import { PEOPLE } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PersonSwitcher() {
  const { activePerson, setActivePerson } = useStore()
  const [open, setOpen] = useState(false)
  const active = PEOPLE.find((p) => p.id === activePerson)!

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
      >
        <Avatar person={active} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{active.name}</div>
          <div className="truncate text-xs text-muted-foreground">{active.role}</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/60"
            >
              <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ansicht wechseln
              </div>
              {PEOPLE.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePerson(p.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <Avatar person={p} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.role}</div>
                  </div>
                  {p.id === activePerson && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Avatar({ person }: { person: (typeof PEOPLE)[number] }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
      )}
      style={{
        backgroundColor: `${person.color}1f`,
        color: person.color,
        border: `1px solid ${person.color}40`,
      }}
    >
      {person.initials}
    </div>
  )
}
