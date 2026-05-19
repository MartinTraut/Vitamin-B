"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Auf dem Handy gar nicht rendern: vollflaechige Canvas + resize bei
  // ein-/ausblendender Adressleiste = Flackern/Haengen beim Scrollen.
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const ok =
      window.innerWidth >= 768 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setEnabled(ok)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let running = true
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Animation anhalten, sobald der Hero aus dem Viewport scrollt
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasRunning = running
        running = entry.isIntersecting
        if (running && !wasRunning) animate()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    // Fewer particles on mobile for performance
    const count = window.innerWidth < 768 ? 30 : 80

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const animate = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(227,152,50, ${p.opacity})`
        ctx.fill()
      })

      // Only draw connections on desktop
      if (canvas.width >= 768) {
        particles.forEach((a, i) => {
          particles.slice(i + 1).forEach((b) => {
            const dist = Math.hypot(a.x - b.x, a.y - b.y)
            if (dist < 150) {
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.strokeStyle = `rgba(227,152,50, ${0.06 * (1 - dist / 150)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          })
        })
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      io.disconnect()
    }
  }, [enabled])

  if (!enabled) return null
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <ParticleField />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-[radial-gradient(circle,rgba(227,152,50,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center flex flex-col items-center justify-center py-28 md:justify-between md:min-h-[100svh] md:py-0 md:pt-40 md:pb-16">
        {/* Top spacer - desktop only (mobile: feste Hoehe, kein Reflow/Zittern) */}
        <div className="hidden md:block shrink-[6]" />

        {/* Center content */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[2.5rem] min-[400px]:text-[3rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 md:mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-white">Ihre Vision</span>
            <br />
            <span className="text-white">wird zu Ihrem</span>
            <br />
            <span className="text-[#E39832]">Brand.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[15px] md:text-xl text-white/60 max-w-2xl mx-auto mb-8 md:mb-8 leading-relaxed"
          >
            Creative Studio für Markenentwicklung und visuelle Identität in
            Neuenstadt am Kocher. Branding, Webdesign und Werbetechnik für die
            Region Heilbronn und den Hohenlohekreis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5 px-4 sm:px-0"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#E39832] [a]:hover:bg-[#E39832] hover:brightness-110 text-white rounded-full px-6 md:px-8 h-12 md:h-14 text-sm md:text-base group w-full sm:w-auto shadow-[0_0_28px_rgba(227,152,50,0.32)] hover:shadow-[0_0_46px_rgba(227,152,50,0.55)] transition-shadow duration-300"
            >
              <a href="#kontakt">
                Erstgespräch vereinbaren
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-6 md:px-8 h-12 md:h-14 text-sm md:text-base border-white/10 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto"
            >
              <a href="#portfolio">Arbeiten ansehen</a>
            </Button>
          </motion.div>

          {/* Stats - same spacing as text→CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 md:mt-8 text-white/30 text-xs md:text-sm"
          >
          {/* Mobile: 3-col grid */}
          <div className="grid grid-cols-3 gap-3 md:hidden">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[#E39832] text-lg font-bold">320+</span>
              <span className="text-[10px]">Marken geformt</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-x border-white/[0.06]">
              <span className="text-[#E39832] text-lg font-bold">20+</span>
              <span className="text-[10px]">Jahre Erfahrung</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[#E39832] text-lg font-bold">100%</span>
              <span className="text-[10px]">Fokus auf Wirkung</span>
            </div>
          </div>
          {/* Desktop: inline flex */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[#E39832] text-2xl font-bold">320+</span>
              <span>Marken geformt</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#E39832] text-2xl font-bold">20+</span>
              <span>Jahre Erfahrung</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#E39832] text-2xl font-bold">100%</span>
              <span>Fokus auf Wirkung</span>
            </div>
          </div>

          </motion.div>
        </div>

        {/* Entdecken - stays at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="hidden md:block md:mt-10"
        >
          <a href="#leistungen" className="hidden md:flex flex-col items-center gap-2 text-white/30 hover:text-[#E39832] transition-colors">
            <span className="text-xs tracking-widest uppercase">Weiter</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
