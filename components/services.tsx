"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Palette,
  Globe,
  Printer,
  Share2,
  Camera,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"

const services = [
  {
    icon: Palette,
    title: "Branding & Corporate Design",
    description:
      "Wir entwickeln einzigartige Markenidentitäten, die Ihre Werte transportieren und Vertrauen schaffen. Von der Logoentwicklung bis zum vollständigen Brand-Guide.",
    features: ["Logo Design", "Brand Strategy", "Style Guides", "Naming"],
  },
  {
    icon: Globe,
    title: "Webdesign & Entwicklung",
    description:
      "Performante, responsive Websites mit modernstem Tech-Stack. SEO-optimiert, blitzschnell und conversion-fokussiert für messbaren Geschäftserfolg.",
    features: ["UI/UX Design", "Responsive", "SEO", "Performance"],
  },
  {
    icon: Printer,
    title: "Print & Drucksachen",
    description:
      "Vom Flyer bis zur Großfläche — wir gestalten Printmedien, die auffallen und in Erinnerung bleiben. Hochwertig, durchdacht und druckfertig.",
    features: ["Flyer & Broschüren", "Plakate", "Verpackungen", "Visitenkarten"],
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description:
      "Strategisches Content-Marketing für maximale Reichweite. Wir erstellen Inhalte, die Ihre Community wachsen lassen und Engagement erzeugen.",
    features: ["Content Creation", "Strategie", "Kampagnen", "Analytics"],
  },
  {
    icon: Camera,
    title: "Fotografie & Video",
    description:
      "Professionelle Bild- und Videoproduktion für Ihre Marke. Authentische Aufnahmen, die Geschichten erzählen und Emotionen wecken.",
    features: ["Produktfotos", "Imagefilme", "Drohne", "Reels & Shorts"],
  },
  {
    icon: BarChart3,
    title: "Marketing & Beratung",
    description:
      "Ganzheitliche Marketing-Beratung für nachhaltiges Wachstum. Wir analysieren, planen und setzen um — datengetrieben und ergebnisorientiert.",
    features: ["Strategie", "Analytics", "SEO/SEA", "Conversion"],
  },
]

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const Icon = service.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ff6a00]/20 transition-all duration-500 h-full hover:bg-white/[0.04]">
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center group-hover:bg-[#ff6a00]/20 transition-colors duration-300">
              <Icon className="w-6 h-6 text-[#ff6a00]" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-[#ff6a00] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {service.features.map((feature) => (
              <span
                key={feature}
                className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/5"
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
    <section id="leistungen" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="max-w-3xl mb-16">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
            Unsere Leistungen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Alles aus einer Hand.
            <br />
            <span className="text-white/30">Alles auf höchstem Niveau.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg"
          >
            Ob Sie eine neue Marke aufbauen oder Ihre bestehende auf das nächste Level
            bringen möchten — wir haben die Expertise, die Sie brauchen.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
