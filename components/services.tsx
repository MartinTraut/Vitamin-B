"use client"

import { motion, useInView, AnimatePresence, LayoutGroup } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Palette,
  Globe,
  Printer,
  Share2,
  Camera,
  BarChart3,
  ArrowUpRight,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TextRotate } from "@/components/ui/text-rotate"

type Service = {
  icon: typeof Palette
  title: string
  short: string
  description: string
  features: string[]
  area: string
  featured?: boolean
  wide?: boolean
  image?: string
  imageFit?: "cover" | "contain"
  imageObjectPosition?: string
}

const rotatingWords = ["Hand", "Vision", "Strategie", "Quelle"]

// Erscheinungs-Reihenfolge "um die Mitte herum" (im Uhrzeigersinn):
const REVEAL_RANK: Record<number, number> = { 0: 0, 1: 1, 3: 2, 5: 3, 4: 4, 2: 5 }

const services: Service[] = [
  {
    icon: Palette,
    title: "Branding & Corporate Design",
    short: "Identität mit System.",
    description:
      "Eine Marke ist kein Logo. Sie ist, wie man Sie wahrnimmt. Wir entwickeln Identitäten mit System. Vom strategischen Fundament bis zum konsistenten Erscheinungsbild, das wiedererkannt wird.",
    features: ["Logo Design", "Brand Strategy", "Style Guides", "Naming"],
    area: "lg:col-start-1 lg:row-start-1 lg:col-span-2",
    featured: true,
    wide: true,
    image: "/services/branding-vitaminb.png",
    imageFit: "cover",
  },
  {
    icon: Globe,
    title: "Webdesign & Entwicklung",
    short: "Auftritte, die in Sekunden wirken.",
    description:
      "Die Website ist der erste Eindruck Ihrer Marke. Wir gestalten digitale Auftritte, die in Sekunden wirken. Klar strukturiert, schnell und gebaut, um Besucher zu führen.",
    features: ["UI/UX Design", "Responsive", "SEO", "Performance"],
    area: "lg:col-start-3 lg:row-start-1",
    image: "/services/webdesign-vitaminb.png",
    imageFit: "cover",
  },
  {
    icon: Printer,
    title: "Print & Drucksachen",
    short: "Greifbar, präzise, hochwertig.",
    description:
      "Print bleibt greifbar. Vom Geschäftspapier bis zur Großfläche gestalten wir Druckmedien mit Haltung. Präzise, hochwertig produziert und im Einklang mit der Markenidentität.",
    features: ["Geschäftsausstattung", "Broschüren", "Plakate", "Verpackung"],
    area: "lg:col-start-1 lg:row-start-2",
    image: "/services/branding.png",
    imageFit: "cover",
  },
  {
    icon: Share2,
    title: "Social Media",
    short: "Wiedererkennung im Feed.",
    description:
      "Im Feed entscheidet ein Moment. Wir entwickeln Inhalte mit klarer visueller Sprache. Konsistent zur Marke, durchdacht statt laut, gemacht, um wiedererkannt zu werden.",
    features: ["Content Design", "Strategie", "Kampagnen", "Templates"],
    area: "lg:col-start-3 lg:row-start-2",
    image: "/services/social.webp",
  },
  {
    icon: Camera,
    title: "Fotografie & Video",
    short: "Echtes Bildmaterial mit Charakter.",
    description:
      "Bilder sprechen schneller als Worte. Wir erzeugen visuelles Material mit Charakter. Echt statt Stockfoto, kuratiert auf die Bildsprache Ihrer Marke.",
    features: ["Produktfotos", "Imagefilm", "Reels", "Bildsprache"],
    area: "lg:col-start-1 lg:row-start-3 lg:col-span-2",
    wide: true,
    image: "/services/fotografie-vitaminb.jpg",
    imageFit: "cover",
    imageObjectPosition: "center",
  },
  {
    icon: BarChart3,
    title: "Marketing & Beratung",
    short: "Strategie vor Gestaltung.",
    description:
      "Strategie geht der Gestaltung voraus. Wir analysieren Positionierung und Wahrnehmung, schärfen die Richtung und übersetzen sie in klare, wirksame Maßnahmen.",
    features: ["Positionierung", "Markt & Wettbewerb", "Content-Strategie", "SEO"],
    area: "lg:col-start-3 lg:row-start-3",
    image: "/services/marketing.jpg",
  },
]

function FeatureTile() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glow-border lg:col-start-2 lg:row-start-2 group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(227,152,50,0.10),transparent_70%)]" />
      <div className="relative z-10 h-full min-h-[200px] flex flex-col justify-center items-center text-center p-8">
        <h3
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.18] px-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Alles aus
          <br />
          <LayoutGroup>
            <motion.span className="inline-flex items-baseline gap-[0.28em]" layout>
              <motion.span
                layout
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                einer
              </motion.span>
              <TextRotate
                texts={rotatingWords}
                mainClassName="text-[#E39832] overflow-hidden justify-center"
                staggerFrom="last"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2400}
              />
            </motion.span>
          </LayoutGroup>
        </h3>
      </div>
    </motion.div>
  )
}

function ServiceCard({
  service,
  index,
  onOpen,
}: {
  service: Service
  index: number
  onOpen: () => void
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = service.icon
  const rank = REVEAL_RANK[index] ?? index
  const delay = 0.18 + rank * 0.09

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Mehr über ${service.title} erfahren`}
      className={cn(
        "group relative w-full h-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E39832]/60 rounded-2xl",
        service.area,
      )}
    >
      <div className="glow-border isolate relative h-full flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-colors duration-500 hover:bg-white/[0.04] [transform:translateZ(0)] [backface-visibility:hidden]">
        {/* Header: Icon + Titel nebeneinander */}
        <div className="relative z-10 flex items-center justify-between gap-3 p-5 md:p-6 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#E39832]/10 flex items-center justify-center group-hover:bg-[#E39832]/20 transition-colors duration-500">
              <Icon className="w-5 h-5 md:w-[22px] md:h-[22px] text-[#E39832]" />
            </div>
            <h3
              className="text-base md:text-lg font-semibold text-white leading-tight group-hover:text-[#E39832] transition-colors duration-500 truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {service.title}
            </h3>
          </div>
          <ArrowUpRight className="shrink-0 w-5 h-5 text-white/20 group-hover:text-[#E39832] transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>

        {service.wide ? (
          /* Wide-Layout: Bild links, Chips rechts vertikal gestapelt */
          <div className="flex-1 min-h-[200px] flex gap-4 md:gap-5 px-5 md:px-6 pb-5 md:pb-6">
            <div className="relative z-10 flex flex-col justify-center gap-3 md:gap-4 w-[34%] max-w-[200px] shrink-0">
              {service.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-2 text-[11px] md:text-xs font-medium tracking-wide px-3 py-2 rounded-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-white/75 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] group-hover:border-[#E39832]/40 group-hover:from-[#E39832]/[0.12] group-hover:to-[#E39832]/[0.04] group-hover:text-white transition-all duration-500"
                >
                  <span className="w-1 h-1 rounded-full bg-[#E39832] shadow-[0_0_6px_rgba(227,152,50,0.6)] shrink-0" />
                  <span className="truncate">{feature}</span>
                </span>
              ))}
            </div>
            {service.image && (
              <div
                className={cn(
                  "flex-1 min-w-0 relative overflow-hidden",
                  service.imageFit === "contain"
                    ? ""
                    : "rounded-2xl bg-black/40 border border-white/[0.04]",
                )}
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                  className={cn(
                    "transition-transform duration-700 group-hover:scale-[1.04]",
                    service.imageFit === "contain" ? "object-contain" : "object-cover",
                  )}
                  style={{ objectPosition: service.imageObjectPosition ?? "center" }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Bild — wächst flexibel, gleicht Card-Hoehen aus */}
            {service.image && (
              <div className="px-5 md:px-6 flex-1 min-h-[180px] flex">
                <div className="relative w-full overflow-hidden rounded-2xl bg-black/40 border border-white/[0.04]">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 768px) 45vw, 90vw"
                    className={cn(
                      "transition-transform duration-700 group-hover:scale-[1.04]",
                      service.imageFit === "contain" ? "object-contain" : "object-cover",
                    )}
                    style={{ objectPosition: service.imageObjectPosition ?? "center" }}
                  />
                </div>
              </div>
            )}

            {/* Infobox: Premium Chips mit Markenakzent */}
            <div className="relative z-10 mt-auto flex flex-wrap gap-2 p-5 md:p-6 pt-4">
              {service.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-medium tracking-wide px-3 py-1.5 rounded-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-white/75 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] group-hover:border-[#E39832]/40 group-hover:from-[#E39832]/[0.12] group-hover:to-[#E39832]/[0.04] group-hover:text-white transition-all duration-500"
                >
                  <span className="w-1 h-1 rounded-full bg-[#E39832] shadow-[0_0_6px_rgba(227,152,50,0.6)]" />
                  {feature}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.button>
  )
}

function ServiceModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const Icon = service.icon

  useEffect(() => {
    // Scroll-Lock ohne Header-Ruckler: html nutzt scrollbar-gutter:stable,
    // dadurch verschwindet die Scrollbar-Spur beim Sperren nicht und der
    // fixierte Header verschiebt sich nicht horizontal.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full md:max-w-3xl h-[86svh] md:h-auto md:max-h-[88vh] overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/[0.08] z-10"
      >
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#E39832] shadow-lg shadow-black/30 flex items-center justify-center text-white hover:brightness-110 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {service.image && (
          <div className="relative shrink-0 w-full h-56 md:h-80 overflow-hidden bg-black/40">
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className={cn(
                service.imageFit === "contain" ? "object-contain" : "object-cover",
              )}
              style={{ objectPosition: service.imageObjectPosition ?? "center" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
          </div>
        )}

        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 md:p-8 relative z-10 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[#E39832]/10 flex items-center justify-center">
              <Icon className="w-[22px] h-[22px] text-[#E39832]" />
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {service.title}
            </h2>
          </div>

          <p className="text-[#E39832] text-sm md:text-base font-medium mb-4">
            {service.short}
          </p>

          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
            {service.description}
          </p>

          <h4 className="text-white text-xs font-semibold mb-3 uppercase tracking-wider">
            Was dazugehört
          </h4>
          <div className="grid grid-cols-2 gap-2 md:gap-3 pb-2">
            {service.features.map((f) => (
              <div
                key={f}
                className="px-4 py-3 rounded-xl bg-[#E39832]/5 border border-[#E39832]/15 text-white/75 text-sm"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selected, setSelected] = useState<Service | null>(null)

  return (
    <section id="leistungen" className="relative py-16 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="max-w-3xl mb-10 md:mb-16">
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
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Von der Strategie bis zur Gestaltung.
            <br />
            <span className="text-[#E39832]">Alles aus einer Hand.</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: "left" }}
            className="h-[2px] w-20 bg-gradient-to-r from-[#E39832] to-transparent mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white/50 text-lg"
          >
            Ob neue Marke oder geschärftes Profil. Jede Disziplin folgt derselben
            Logik: erst die Strategie, dann die Gestaltung, dann die Wirkung.
            <span className="block mt-2 text-white/35 text-sm">Tippen Sie eine Leistung an für Details.</span>
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 lg:auto-rows-fr gap-4 md:gap-5">
          {services.slice(0, 3).map((service, i) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={i}
              onOpen={() => setSelected(service)}
            />
          ))}
          <FeatureTile />
          {services.slice(3).map((service, i) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={i + 3}
              onOpen={() => setSelected(service)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ServiceModal service={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
