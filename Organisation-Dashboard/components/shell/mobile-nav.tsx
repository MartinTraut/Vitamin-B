"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Calendar, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileMenu } from "./mobile-menu"

const PRIMARY = [
  { href: "/", label: "Start", icon: LayoutDashboard },
  { href: "/aufgaben", label: "Aufgaben", icon: CheckSquare },
  { href: "/kalender", label: "Kalender", icon: Calendar },
]

export function MobileNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // "Mehr" ist aktiv, sobald wir nicht auf einer der Primär-Routen sind.
  const onPrimary = PRIMARY.some((i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)))

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        {PRIMARY.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Mehr anzeigen"
          aria-expanded={menuOpen}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
            !onPrimary || menuOpen ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Menu className="h-5 w-5" />
          Mehr
        </button>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
