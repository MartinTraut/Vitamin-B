"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { NAV } from "./nav"
import { PersonSwitcher } from "./person-switcher"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-[268px] shrink-0 flex-col border-r border-border bg-[#070707] lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-[18px]">
        <Image
          src="/logo-vitaminb-orange.png"
          alt="vitamin b"
          width={600}
          height={215}
          priority
          className="h-7 w-auto"
        />
        <span className="ml-auto rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          OS
        </span>
      </div>

      {/* Person */}
      <div className="border-b border-border px-3 py-3">
        <PersonSwitcher />
      </div>

      {/* Navigation — Gruppen klar getrennt */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV.map((group, gi) => (
          <div
            key={group.label}
            className={cn(
              "py-3",
              gi !== NAV.length - 1 && "border-b border-border/50",
            )}
          >
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg border border-primary/30 bg-primary/[0.12] shadow-[inset_2px_0_0_0_var(--primary)]"
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="relative z-10 flex-1">{item.label}</span>
                    {item.soon && (
                      <span className="relative z-10 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        bald
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Demo-Modus · lokale Daten
      </div>
    </aside>
  )
}
