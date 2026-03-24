"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

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
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 106, 0, ${p.opacity})`
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
              ctx.strokeStyle = `rgba(255, 106, 0, ${0.06 * (1 - dist / 150)})`
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
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <ParticleField />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-[radial-gradient(circle,rgba(255,106,0,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center flex flex-col items-center justify-between min-h-[100svh] py-24 md:py-28">
        {/* Top spacer - smaller to push content up */}
        <div className="shrink-[3]" />

        {/* Center content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#ff6a00]/20 bg-[#ff6a00]/5 text-[#ff6a00] text-xs md:text-sm">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#ff6a00] animate-pulse" />
              Kreativagentur aus der Region Heilbronn
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[3.5rem] leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 md:mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-white">Wir gestalten</span>
            <br />
            <span className="gradient-text">Marken, die</span>
            <br />
            <span className="text-white">verkaufen.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[15px] md:text-xl text-white/60 max-w-2xl mx-auto mb-8 md:mb-8 leading-relaxed"
          >
            Strategie, Design und Umsetzung aus einer Hand. Wir bauen visuelle Identitäten,
            die Ihre Zielgruppe begeistern und Ihren Umsatz spürbar steigern.
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
              className="bg-[#ff6a00] hover:bg-[#ff8c33] text-white rounded-full px-6 md:px-8 h-12 md:h-14 text-sm md:text-base group animate-pulse-glow w-full sm:w-auto"
            >
              <a href="#kontakt">
                Kostenloses Erstgespräch
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-6 md:px-8 h-12 md:h-14 text-sm md:text-base border-white/10 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto"
            >
              <a href="#portfolio">Portfolio ansehen</a>
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
              <span className="text-[#ff6a00] text-lg font-bold">50+</span>
              <span className="text-[10px]">zufriedene Kunden</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-x border-white/[0.06]">
              <span className="text-[#ff6a00] text-lg font-bold">8+</span>
              <span className="text-[10px]">Jahre Erfahrung</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[#ff6a00] text-lg font-bold">100%</span>
              <span className="text-[10px]">Leidenschaft</span>
            </div>
          </div>
          {/* Desktop: inline flex */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[#ff6a00] text-2xl font-bold">50+</span>
              <span>zufriedene Kunden</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#ff6a00] text-2xl font-bold">8+</span>
              <span>Jahre Erfahrung</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#ff6a00] text-2xl font-bold">100%</span>
              <span>Leidenschaft</span>
            </div>
          </div>

          </motion.div>
        </div>

        {/* Entdecken - stays at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <a href="#leistungen" className="hidden md:flex flex-col items-center gap-2 text-white/30 hover:text-[#ff6a00] transition-colors">
            <span className="text-xs tracking-widest uppercase">Entdecken</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
