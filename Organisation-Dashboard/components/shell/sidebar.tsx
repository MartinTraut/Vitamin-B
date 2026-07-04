"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut } from "lucide-react"
import { NAV } from "./nav"
import { PersonSwitcher } from "./person-switcher"
import { useAuth } from "@/lib/auth"
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

      {/* Navigation — Gruppen farblich getrennt & animiert */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV.map((group, gi) => (
          <div
            key={group.label}
            className={cn("py-3", gi !== NAV.length - 1 && "border-b border-border/50")}
          >
            <div className="flex items-center gap-2 px-2 pb-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: group.accent, boxShadow: `0 0 8px ${group.accent}99` }}
              />
              <span className="eyebrow" style={{ color: `${group.accent}cc` }}>
                {group.label}
              </span>
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <motion.div key={item.href} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 32 }}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                      style={{ ["--acc" as string]: group.accent }}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg border"
                          style={{
                            backgroundColor: `${group.accent}1f`,
                            borderColor: `${group.accent}55`,
                            boxShadow: `inset 2px 0 0 0 ${group.accent}, 0 0 14px ${group.accent}26`,
                          }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                      <item.icon
                        className="relative z-10 h-[18px] w-[18px] shrink-0 transition-colors group-hover:[color:var(--acc)]"
                        style={active ? { color: group.accent } : undefined}
                      />
                      <span className="relative z-10 flex-1 transition-colors group-hover:text-foreground">{item.label}</span>
                      {item.soon && (
                        <span
                          className="relative z-10 rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
                          style={{ backgroundColor: `${group.accent}1a`, color: `${group.accent}cc` }}
                        >
                          bald
                        </span>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <SidebarFooter />
    </aside>
  )
}

function SidebarFooter() {
  const { enabled, authed, signOut } = useAuth()
  const online = enabled && authed

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-success" : "bg-muted-foreground/60")} />
        {online ? "Team verbunden · Echtzeit" : "Demo-Modus · lokale Daten"}
      </span>
      {online && (
        <button
          onClick={() => signOut()}
          title="Abmelden"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Abmelden
        </button>
      )}
    </div>
  )
}
