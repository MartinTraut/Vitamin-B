"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Search,
  Users,
  GitBranch,
  FileText,
  Receipt,
  CheckSquare,
  Calendar,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { ALL_ITEMS } from "./nav"
import { eur0 } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Result {
  id: string
  title: string
  subtitle: string
  group: string
  href: string
  icon: LucideIcon
}

export function CommandPalette() {
  const router = useRouter()
  const { db } = useStore()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Globaler ⌘K / Strg-K Listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    const onOpen = () => setOpen(true)
    document.addEventListener("keydown", onKey)
    window.addEventListener("open-command-palette", onOpen)
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("open-command-palette", onOpen)
    }
  }, [])

  // Beim Öffnen zurücksetzen + fokussieren.
  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      const t = window.setTimeout(() => inputRef.current?.focus(), 30)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const results = useMemo<Result[]>(() => {
    const customerName = (id: string) => db.customers.find((c) => c.id === id)?.company ?? "—"
    const all: Result[] = [
      ...ALL_ITEMS.map((i) => ({ id: `nav-${i.href}`, title: i.label, subtitle: i.subtitle, group: "Navigation", href: i.href, icon: i.icon })),
      ...db.customers.map((c) => ({ id: c.id, title: c.company, subtitle: c.contactName ?? "Kunde", group: "Kunden", href: "/crm", icon: Users })),
      ...db.deals.map((d) => ({ id: d.id, title: d.title, subtitle: `${customerName(d.customerId)} · ${eur0(d.value)}`, group: "Pipeline", href: "/pipeline", icon: GitBranch })),
      ...db.quotes.map((q) => ({ id: q.id, title: `Angebot ${q.number}`, subtitle: customerName(q.customerId), group: "Angebote", href: "/angebote", icon: FileText })),
      ...db.invoices.map((i) => ({ id: i.id, title: `Rechnung ${i.number}`, subtitle: customerName(i.customerId), group: "Rechnungen", href: "/rechnungen", icon: Receipt })),
      ...db.tasks.map((t) => ({ id: t.id, title: t.title, subtitle: "Aufgabe", group: "Aufgaben", href: "/aufgaben", icon: CheckSquare })),
      ...db.appointments.map((a) => ({ id: a.id, title: a.title, subtitle: a.date, group: "Termine", href: "/kalender", icon: Calendar })),
    ]
    const q = query.trim().toLowerCase()
    if (!q) return all.filter((r) => r.group === "Navigation")
    return all.filter((r) => `${r.title} ${r.subtitle}`.toLowerCase().includes(q)).slice(0, 24)
  }, [db, query])

  useEffect(() => {
    if (active >= results.length) setActive(Math.max(0, results.length - 1))
  }, [results, active])

  function go(r: Result) {
    // Bei Entitäten die ID mitgeben → Zielview selektiert den Datensatz vor.
    router.push(r.group === "Navigation" ? r.href : `${r.href}?sel=${r.id}`)
    setOpen(false)
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]) }
  }

  // Aktives Element in den sichtbaren Bereich scrollen.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [active])

  if (!mounted) return null

  // Ergebnisse nach Gruppe bündeln (Reihenfolge der ersten Vorkommen erhalten).
  const groups: { name: string; items: { r: Result; idx: number }[] }[] = []
  results.forEach((r, idx) => {
    let g = groups.find((x) => x.name === r.group)
    if (!g) { g = { name: r.group, items: [] }; groups.push(g) }
    g.items.push({ r, idx })
  })

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Suche">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 440, damping: 34 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                placeholder="Suchen — Kunden, Belege, Aufgaben, Seiten…"
                className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nichts gefunden für „{query}“.</p>
              )}
              {groups.map((g) => (
                <div key={g.name} className="mb-1.5">
                  <div className="eyebrow px-2 py-1.5">{g.name}</div>
                  {g.items.map(({ r, idx }) => {
                    const isActive = idx === active
                    return (
                      <button
                        key={r.id}
                        data-idx={idx}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => go(r)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                          isActive ? "bg-primary/[0.12]" : "hover:bg-white/[0.04]",
                        )}
                      >
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", isActive ? "bg-primary/20 text-primary" : "bg-white/[0.05] text-muted-foreground")}>
                          <r.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{r.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                        </span>
                        {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
