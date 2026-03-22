"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

const values = [
  {
    title: "Qualität vor Quantität",
    description:
      "Wir nehmen uns Zeit für jedes Projekt und liefern nur Ergebnisse, hinter denen wir zu 100% stehen.",
  },
  {
    title: "Partnerschaftlich",
    description:
      "Wir arbeiten nicht für Sie, sondern mit Ihnen. Transparente Kommunikation und ehrliches Feedback.",
  },
  {
    title: "Strategisch & Kreativ",
    description:
      "Design ohne Strategie ist Kunst. Wir verbinden Kreativität mit datengetriebenen Entscheidungen.",
  },
  {
    title: "Regional verwurzelt",
    description:
      "Als Agentur aus Neuenstadt am Kocher kennen wir den regionalen Markt und Ihre Zielgruppe.",
  },
]

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="ueber-uns" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,106,0,0.04),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="/hero-bg.jpg"
                alt="vitamin b Kommunikation & Design"
                fill
                className="object-cover object-center"
                quality={95}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-4 right-0 md:-bottom-6 md:-right-6 bg-[#0d0d0d] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-xl"
            >
              <div className="text-2xl md:text-4xl font-bold text-[#ff6a00] mb-1">8+</div>
              <div className="text-white/50 text-xs md:text-sm">
                Jahre Erfahrung in
                <br />
                Design & Kommunikation
              </div>
            </motion.div>

            <div className="absolute -top-4 -left-4 w-16 h-16 md:w-24 md:h-24 border-t-2 border-l-2 border-[#ff6a00]/30 rounded-tl-2xl hidden md:block" />
          </motion.div>

          {/* Content side */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
            >
              Über uns
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wir sind vitamin b.
              <br />
              <span className="text-white/30">Ihr kreatives Vitamin.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-white/50 text-lg leading-relaxed mb-8"
            >
              Gegründet von Robert Bauer mit einer klaren Vision: Kleinen und mittelständischen
              Unternehmen in der Region Heilbronn Zugang zu erstklassigem Design geben.
              Wir glauben, dass gutes Design kein Luxus ist. Sondern eine Investition, die
              sich auszahlt.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 }}
              className="text-white/50 text-lg leading-relaxed mb-10"
            >
              Vitamin B steht nicht nur für unseren Namen. Es steht für Beziehungen.
              Denn die besten Projekte entstehen, wenn Agentur und Kunde auf Augenhöhe
              zusammenarbeiten.
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#ff6a00] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium mb-1">{value.title}</h4>
                      <p className="text-white/40 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
