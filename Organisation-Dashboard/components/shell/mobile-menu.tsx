"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"
import { useStore } from "@/lib/store"
import { PEOPLE } from "@/lib/types"
import { NAV } from "./nav"
import { cn } from "@/lib/utils"

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { activePerson, setActivePerson } = useStore()

  // Escape schließt; Body-Scroll sperren solange offen.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menü">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-4 pb-8 pt-3"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading text-base font-semibold">Menü</span>
              <button
                onClick={onClose}
                aria-label="Schließen"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Personen-Switcher */}
            <div className="mb-5">
              <div className="eyebrow mb-2">Ansicht</div>
              <div className="grid grid-cols-3 gap-2">
                {PEOPLE.map((p) => {
                  const active = p.id === activePerson
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePerson(p.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors",
                        active ? "border-transparent" : "border-border",
                      )}
                      style={active ? { backgroundColor: `${p.color}1f` } : undefined}
                    >
                      <span
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold"
                        style={{ backgroundColor: `${p.color}1f`, color: p.color, border: `1px solid ${p.color}40` }}
                      >
                        {p.initials}
                        {active && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-medium" style={active ? { color: p.color } : undefined}>{p.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-4">
              {NAV.map((group) => (
                <div key={group.label}>
                  <div className="eyebrow mb-1.5" style={{ color: group.accent }}>{group.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border p-3 transition-colors",
                            active ? "border-transparent bg-white/[0.06]" : "border-border",
                          )}
                          style={active ? { color: group.accent } : undefined}
                        >
                          <item.icon className="h-5 w-5 shrink-0" style={{ color: active ? group.accent : undefined }} />
                          <span className="truncate text-sm font-medium">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
