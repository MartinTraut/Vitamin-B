"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Menu, X, Briefcase, FolderOpen, User, Settings, HelpCircle, Mail, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = navItems.map((item) => {
        const id = item.url.replace("#", "")
        const el = document.getElementById(id)
        return { name: item.name, el }
      })
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.el) {
          const rect = section.el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveTab(section.name)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    e.preventDefault()
    setActiveTab(item.name)
    const el = document.getElementById(item.url.replace("#", ""))
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 py-4 md:py-6 ${
          scrolled ? "bg-[#050505]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between relative">
          {/* Logo */}
          <a href="#" className="shrink-0">
            <Image
              src="/logo-full.png"
              alt="vitamin b kommunikation & design"
              width={782}
              height={228}
              className="w-auto h-9 md:h-10"
              priority
              unoptimized
            />
          </a>

          {/* Desktop NavBar - absolutely centered */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl py-1.5 px-1.5 rounded-full absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = activeTab === item.name
              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors",
                    "text-white/60 hover:text-[#ff6a00]",
                    isActive && "text-[#ff6a00]",
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 w-full bg-[#ff6a00]/5 rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </a>
              )
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block shrink-0">
            <Button asChild className="bg-[#ff6a00] hover:bg-[#ff8c33] text-white rounded-full px-6 group">
              <a href="#kontakt">
                Projekt starten
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2 -mr-2"
            aria-label="Menü öffnen"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Bottom NavBar — Floating Glass Pill */}
      <div className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-5 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl py-1.5 px-2 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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
                  isActive ? "text-[#ff6a00]" : "text-white/50",
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="lamp-mobile"
                    className="absolute inset-0 bg-[#ff6a00]/[0.08] rounded-full -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
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
                  className="text-xl font-light text-white/80 hover:text-[#ff6a00] transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}
              <Button asChild size="lg" className="bg-[#ff6a00] hover:bg-[#ff8c33] text-white rounded-full px-8 mt-2">
                <a href="#kontakt" onClick={() => setMobileOpen(false)}>Projekt starten</a>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
