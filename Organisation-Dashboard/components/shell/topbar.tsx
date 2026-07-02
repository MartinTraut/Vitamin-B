"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Search, Check, ChevronDown, Plus } from "lucide-react"
import { ALL_ITEMS } from "./nav"
import { PEOPLE } from "@/lib/types"
import { useStore } from "@/lib/store"

function openSearch() {
  window.dispatchEvent(new Event("open-command-palette"))
}
function openQuickAdd() {
  window.dispatchEvent(new Event("open-quick-add"))
}

export function Topbar() {
  const pathname = usePathname()
  const { activePerson, setActivePerson } = useStore()
  const person = PEOPLE.find((p) => p.id === activePerson)!
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    const onClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPickerOpen(false)
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [pickerOpen])

  const item =
    ALL_ITEMS.find((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    ) ?? ALL_ITEMS[0]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-xl sm:gap-4 sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-vitaminb-orange.png" alt="Vitamin B" className="h-6 w-auto shrink-0 lg:hidden" />
        <div className="min-w-0">
          <h1 className="truncate font-heading text-[clamp(1.1rem,3.5vw+0.3rem,1.25rem)] font-bold tracking-[-0.02em] lg:text-2xl">
            {item.label}
          </h1>
          <p className="truncate text-xs text-muted-foreground lg:text-sm">{item.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={openQuickAdd}
          aria-label="Schnell erfassen"
          title="Schnell erfassen (⌘⇧A)"
          className="hidden items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground lg:flex"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xl:inline">Erfassen</span>
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] xl:inline">⌘⇧A</kbd>
        </button>
        <button
          onClick={openSearch}
          aria-label="Suche öffnen"
          className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Suchen</span>
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] md:inline">⌘K</kbd>
        </button>
        {/* Desktop (>=lg): statische Anzeige — Personenwechsel läuft hier über die Sidebar, daher unverändert */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Aktive Ansicht</div>
            <div className="text-sm font-medium" style={{ color: person.color }}>
              {person.name}
            </div>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${person.color}1f`, color: person.color, border: `1px solid ${person.color}40` }}
          >
            {person.initials}
          </div>
        </div>

        {/* Mobile/Tablet: antippbarer Personen-Wechsler (Sidebar ist hier ausgeblendet) */}
        <div className="relative lg:hidden" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            aria-label="Ansicht wechseln"
            aria-expanded={pickerOpen}
            className="flex items-center gap-2 rounded-xl border border-transparent py-1 pl-1 pr-1.5 transition-colors hover:border-border hover:bg-white/[0.03]"
          >
            <div className="hidden text-right sm:block">
              <div className="text-xs text-muted-foreground">Aktive Ansicht</div>
              <div className="text-sm font-medium" style={{ color: person.color }}>
                {person.name}
              </div>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold"
              style={{
                backgroundColor: `${person.color}1f`,
                color: person.color,
                border: `1px solid ${person.color}40`,
              }}
            >
              {person.initials}
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
          </button>

          {pickerOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/60">
              <div className="eyebrow px-2 py-1.5">Ansicht wechseln</div>
              {PEOPLE.map((p) => {
                const active = p.id === activePerson
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePerson(p.id)
                      setPickerOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
                    style={active ? { backgroundColor: `${p.color}1a` } : undefined}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ backgroundColor: `${p.color}1f`, color: p.color, border: `1px solid ${p.color}40` }}
                    >
                      {p.initials}
                    </span>
                    <span className="flex-1 text-sm font-medium" style={active ? { color: p.color } : undefined}>
                      {p.name}
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0" style={{ color: p.color }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
