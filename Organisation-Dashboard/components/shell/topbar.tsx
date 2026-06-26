"use client"

import { usePathname } from "next/navigation"
import { ALL_ITEMS } from "./nav"
import { PEOPLE } from "@/lib/types"
import { useStore } from "@/lib/store"

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
