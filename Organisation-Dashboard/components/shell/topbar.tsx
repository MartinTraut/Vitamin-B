"use client"

import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { ALL_ITEMS } from "./nav"
import { PEOPLE } from "@/lib/types"
import { useStore } from "@/lib/store"

function openSearch() {
  window.dispatchEvent(new Event("open-command-palette"))
}

export function Topbar() {
  const pathname = usePathname()
  const { activePerson } = useStore()
  const person = PEOPLE.find((p) => p.id === activePerson)!

  const item =
    ALL_ITEMS.find((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    ) ?? ALL_ITEMS[0]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-[-0.02em] lg:text-2xl">
          {item.label}
        </h1>
        <p className="text-xs text-muted-foreground lg:text-sm">{item.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={openSearch}
          aria-label="Suche öffnen"
          className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Suchen</span>
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] md:inline">⌘K</kbd>
        </button>
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
      </div>
    </header>
  )
}
