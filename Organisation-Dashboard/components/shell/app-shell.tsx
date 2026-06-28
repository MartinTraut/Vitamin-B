import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { MobileNav } from "./mobile-nav"
import { QuickAdd } from "./quick-add"
import { CommandPalette } from "./command-palette"
import { ThemeController } from "./theme-controller"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
      <QuickAdd />
      <CommandPalette />
      <ThemeController />
    </div>
  )
}
