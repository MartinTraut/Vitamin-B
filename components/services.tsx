"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import {
  Palette,
  Globe,
  Printer,
  Share2,
  Camera,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    icon: Palette,
    title: "Branding & Corporate Design",
    description:
      "Eine Marke ist kein Logo. Sie ist, wie man Sie wahrnimmt. Wir entwickeln Identitäten mit System. Vom strategischen Fundament bis zum konsistenten Erscheinungsbild, das wiedererkannt wird.",
    features: ["Logo Design", "Brand Strategy", "Style Guides", "Naming"],
    area: "lg:col-start-1 lg:row-start-1 lg:col-span-2",
    featured: true,
  },
  {
    icon: Globe,
    title: "Webdesign & Entwicklung",
    description:
      "Die Website ist der erste Eindruck Ihrer Marke. Wir gestalten digitale Auftritte, die in Sekunden wirken. Klar strukturiert, schnell und gebaut, um Besucher zu führen.",
    features: ["UI/UX Design", "Responsive", "SEO", "Performance"],
    area: "lg:col-start-3 lg:row-start-1",
  },
  {
    icon: Printer,
    title: "Print & Drucksachen",
    description:
      "Print bleibt greifbar. Vom Geschäftspapier bis zur Großfläche gestalten wir Druckmedien mit Haltung. Präzise, hochwertig produziert und im Einklang mit der Markenidentität.",
    features: ["Geschäftsausstattung", "Broschüren", "Plakate", "Verpackung"],
    area: "lg:col-start-1 lg:row-start-2",
  },
  {
    icon: Share2,
    title: "Social Media",
    description:
      "Im Feed entscheidet ein Moment. Wir entwickeln Inhalte mit klarer visueller Sprache. Konsistent zur Marke, durchdacht statt laut, gemacht, um wiedererkannt zu werden.",
    features: ["Content Design", "Strategie", "Kampagnen", "Templates"],
    area: "lg:col-start-3 lg:row-start-2",
  },
  {
    icon: Camera,
    title: "Fotografie & Video",
    description:
      "Bilder sprechen schneller als Worte. Wir erzeugen visuelles Material mit Charakter. Echt statt Stockfoto, kuratiert auf die Bildsprache Ihrer Marke.",
    features: ["Produktfotos", "Imagefilm", "Reels", "Bildsprache"],
    area: "lg:col-start-1 lg:row-start-3 lg:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Marketing & Beratung",
    description:
      "Strategie geht der Gestaltung voraus. Wir analysieren Positionierung und Wahrnehmung, schärfen die Richtung und übersetzen sie in klare, wirksame Maßnahmen.",
    features: ["Positionierung", "Markt & Wettbewerb", "Content-Strategie", "SEO"],
    area: "lg:col-start-3 lg:row-start-3",
  },
]

const rotatingWords = ["Hand", "Vision", "Strategie", "Quelle"]

function RotatingWord() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % rotatingWords.length),
      2200,
    )
    return () => clearInterval(id)
  }, [])

  // Breite passt sich automatisch an das aktuelle Wort an, der Abstand zu "einer" bleibt konstant
  return (
    <span className="relative inline-flex overflow-hidden align-baseline leading-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          layout
          initial={{ y: "0.5em", opacity: 0 }}
          animate={{ y: "0em", opacity: 1 }}
          exit={{ y: "-0.5em", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="whitespace-nowrap text-[#E39832]"
        >
          {rotatingWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function FeatureTile() {
  return (
    <div className="glow-border lg:col-start-2 lg:row-start-2 group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
      <div className="absolute inset-0 bg-grid opacity-[0.18]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(227,152,50,0.10),transparent_70%)]" />
      <div className="relative z-10 h-full min-h-[200px] flex flex-col justify-center items-center text-center p-8">
        <h3
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.05]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Alles aus
          <br />
          <motion.span layout className="inline-flex items-baseline gap-[0.28em]">
            einer <RotatingWord />
          </motion.span>
        </h3>
      </div>
    </div>
  )
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = service.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("group relative", service.area)}
    >
      <div
        className={cn(
          "relative h-full p-7 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] transition-all duration-500 hover:bg-white/[0.04] hover-aura",
          service.featured ? "glow-border" : "hover-glow hover:border-[#E39832]/30",
        )}
      >
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(227,152,50,0.07),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#E39832]/10 flex items-center justify-center group-hover:bg-[#E39832]/20 transition-colors duration-500">
              <Icon className="w-6 h-6 text-[#E39832]" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/10 group-hover:text-[#E39832] transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#E39832] transition-colors duration-500">
            {service.title}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed mb-6 group-hover:text-white/55 transition-colors duration-500">
            {service.description}
          </p>

          <div className="mt-auto flex flex-wrap gap-2">
            {service.features.map((feature) => (
              <span
                key={feature}
                className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/5 group-hover:border-white/10 group-hover:text-white/50 transition-all duration-500"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="leistungen" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="max-w-3xl mb-16">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
            Leistungen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Strategie trifft Gestaltung.
            <br />
            <span className="text-white/30">Aus einer Hand.</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "80px" } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-[2px] bg-gradient-to-r from-[#E39832] to-transparent mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white/50 text-lg"
          >
            Ob neue Marke oder geschärftes Profil. Jede Disziplin folgt derselben
            Logik: erst die Strategie, dann die Gestaltung, dann die Wirkung.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 lg:auto-rows-fr gap-4">
          {services.slice(0, 3).map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
          <FeatureTile />
          {services.slice(3).map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i + 3} />
          ))}
        </div>
      </div>
    </section>
  )
}
