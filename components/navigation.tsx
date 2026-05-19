"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Menu, X, Home, Briefcase, FolderOpen, User, Settings, HelpCircle, Mail, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Startseite", url: "#", icon: Home },
  { name: "Leistungen", url: "#leistungen", icon: Briefcase },
  { name: "Portfolio", url: "#portfolio", icon: FolderOpen },
  { name: "Über uns", url: "#ueber-uns", icon: User },
  { name: "Prozess", url: "#prozess", icon: Settings },
  { name: "FAQ", url: "#faq", icon: HelpCircle },
  { name: "Kontakt", url: "#kontakt", icon: Mail },
]

export function Navigation() {
  const [activeTab, setActiveTab] = useState(navItems[0].name)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // Waehrend eines Klick-Scrolls den Scroll-Spy sperren, sonst springt
  // die Markierung durch jede durchscrollte Sektion (hektisches Bouncen).
  const lockSpy = useRef(false)

  useEffect(() => {
    // Section-Elemente einmal cachen, nicht bei jedem Scroll-Tick neu suchen
    const sections = navItems.map((item) => ({
      name: item.name,
      id: item.url.replace("#", ""),
    }))
    let ticking = false

    const measure = () => {
      ticking = false
      setScrolled((prev) => {
        const next = window.scrollY > 50
        return prev === next ? prev : next
      })
      // Waehrend Klick-Scroll: Markierung bleibt auf dem Zielicon,
      // nicht durch jede durchscrollte Sektion springen.
      if (lockSpy.current) return
      // Letzte Sektion finden, deren Oberkante schon durchlaufen ist.
      // Ist man oberhalb der ersten Sektion (Hero/Seitenanfang), faellt
      // die Markierung automatisch auf den ersten Punkt zurueck, statt
      // auf der zuletzt gesetzten haengen zu bleiben.
      let idx = -1
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id)
        if (el && el.getBoundingClientRect().top <= 120) idx = i
      }
      const name = idx === -1 ? sections[0].name : sections[idx].name
      setActiveTab((prev) => (prev === name ? prev : name))
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Einheitlicher Scroll fuer ALLE Sektionen, auch gepinnte Sticky-
  // Sektionen wie Prozess: nicht die Section-Box, sondern die Ueberschrift
  // (h2) positionieren. Sie landet immer mit konstantem kleinem Abstand
  // direkt unter dem Header, der Eyebrow darueber. Kein Leerraum, nicht
  // abgeschnitten, ueberall gleich.
  const scrollToUrl = (url: string) => {
    let top: number | null = null
    if (url === "#") {
      top = 0
    } else {
      const el = document.getElementById(url.replace("#", ""))
      if (el) {
        const heading = el.querySelector("h2") ?? el
        const navEl = document.querySelector("nav")
        const headerOffset = (navEl ? navEl.offsetHeight : 96) + 16
        top = Math.max(
          0,
          window.scrollY +
            heading.getBoundingClientRect().top -
            headerOffset -
            36,
        )
      }
    }
    if (top === null) return

    lockSpy.current = true
    window.scrollTo({ top, behavior: "smooth" })
    const targetTop = top
    const start = performance.now()
    const settle = () => {
      if (Math.abs(window.scrollY - targetTop) < 2 || performance.now() - start > 1400) {
        lockSpy.current = false
        return
      }
      requestAnimationFrame(settle)
    }
    requestAnimationFrame(settle)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    e.preventDefault()
    setActiveTab(item.name)
    scrollToUrl(item.url)
  }

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setActiveTab("Kontakt")
    setMobileOpen(false)
    scrollToUrl("#kontakt")
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 py-4 md:py-6 bg-transparent"
      >
        {/* Schwebender Header: kein harter Balken. Beim Scrollen blendet ein
            weicher dunkler Verlauf ein, damit Logo/Navi auch ueber hellen
            Bildern lesbar bleiben (kein abgesetzter Rand). */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[180%] bg-gradient-to-b from-[#050505]/85 via-[#050505]/45 to-transparent transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between lg:justify-center lg:gap-28 xl:gap-44 relative">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setActiveTab(navItems[0].name)
              lockSpy.current = true
              window.scrollTo({ top: 0, behavior: "smooth" })
              const start = performance.now()
              const settle = () => {
                if (window.scrollY < 2 || performance.now() - start > 1400) {
                  lockSpy.current = false
                  return
                }
                requestAnimationFrame(settle)
              }
              requestAnimationFrame(settle)
            }}
            className="shrink-0 inline-flex items-center"
          >
            <Image
              src="/logo-vitaminb-frame.png"
              alt="vitaminb kommunikation & design"
              width={824}
              height={824}
              className="w-auto h-16 md:h-24 lg:h-28"
              priority
              unoptimized
            />
          </a>

          {/* Desktop NavBar */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl py-1.5 px-1.5 rounded-full shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.name
              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors",
                    "text-white/60 hover:text-[#E39832]",
                    isActive && "text-[#E39832]",
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 w-full bg-[#E39832]/5 rounded-full -z-10"
                      initial={false}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </a>
              )
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block shrink-0">
            <Button asChild className="bg-[#E39832] [a]:hover:bg-[#E39832] hover:brightness-110 text-white rounded-full px-6 group">
              <a href="#kontakt" onClick={handleCtaClick}>
                Projekt starten
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2 -mr-2 ml-auto"
            aria-label="Menü öffnen"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Bottom NavBar — Floating Glass Pill */}
      <div className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-5 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-1 bg-[#0d0d0d]/90 border border-white/[0.08] backdrop-blur-md py-1.5 px-2 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5)] [transform:translateZ(0)]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            return (
              <a
                key={item.name}
                href={item.url}
                onClick={(e) => { handleNavClick(e, item); setMobileOpen(false) }}
                className={cn(
                  "relative p-2.5 rounded-full transition-colors",
                  isActive ? "text-[#E39832]" : "text-white/50",
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="lamp-mobile"
                    className="absolute inset-0 bg-[#E39832]/[0.08] rounded-full -z-10"
                    initial={false}
                    transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
              </a>
            )
          })}
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050505]/98 backdrop-blur-xl flex items-center justify-center lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center gap-6"
            >
              {navItems.map((item, i) => (
                <motion.a
                  key={item.url}
                  href={item.url}
                  onClick={(e) => { handleNavClick(e, item); setMobileOpen(false) }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="text-xl font-light text-white/80 hover:text-[#E39832] transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
              <Button asChild size="lg" className="bg-[#E39832] [a]:hover:bg-[#E39832] hover:brightness-110 text-white rounded-full px-8 mt-2">
                <a href="#kontakt" onClick={handleCtaClick}>Projekt starten</a>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
