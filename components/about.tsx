"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

const values = [
  {
    title: "Klarheit vor Lautstärke",
    description:
      "Wirkung entsteht durch Reduktion, nicht durch Dekoration. Wir lassen weg, was ablenkt, und stärken, was bleibt.",
  },
  {
    title: "Strategie vor Gestaltung",
    description:
      "Design ohne Strategie ist Dekoration. Jede gestalterische Entscheidung folgt einer Richtung, nicht dem Zufall.",
  },
  {
    title: "Auf Augenhöhe",
    description:
      "Marken entstehen im Dialog. Klare Kommunikation, ehrliche Einschätzung, ein Partner statt eines Dienstleisters.",
  },
  {
    title: "Regional verwurzelt",
    description:
      "Studio in Neuenstadt am Kocher, zu Hause in der Region Heilbronn. Nähe zum Markt, der Sie sehen soll.",
  },
]

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="ueber-uns" className="relative py-16 md:py-28 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(227,152,50,0.04),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] w-full lg:max-w-[420px] mx-auto rounded-2xl overflow-hidden bg-[#0a0a0a]">
              <Image
                src="/robert-bauer-portrait.png"
                alt="Robert Bauer, Inhaber von vitaminb kommunikation & design"
                fill
                className="object-cover object-center"
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-4 right-0 md:-bottom-6 md:-right-6 bg-[#0d0d0d] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-xl"
            >
              <div className="text-2xl md:text-4xl font-bold text-[#E39832] mb-1">20+</div>
              <div className="text-white/50 text-xs md:text-sm">
                Jahre Erfahrung in
                <br />
                Marke & Wahrnehmung
              </div>
            </motion.div>

            <div className="absolute -top-4 -left-4 w-16 h-16 md:w-24 md:h-24 border-t-2 border-l-2 border-[#E39832]/30 rounded-tl-2xl hidden md:block" />
          </motion.div>

          {/* Content side */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-4 block"
            >
Studio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Vision to Brand.
              <br />
              <span className="text-white/30">Das ist vitaminb.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-white/50 text-base md:text-lg leading-relaxed mb-4"
            >
              Gegründet von Robert Bauer, mit einer klaren Haltung: Unternehmen in der
              Region Heilbronn eine Markenwahrnehmung geben, die sonst großen Marken
              vorbehalten ist. Gestaltung ist hier kein Kostenpunkt. Sie ist die
              Investition, die entscheidet, wie man gesehen wird.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 }}
              className="text-white/50 text-base md:text-lg leading-relaxed mb-6"
            >
              Im „b" steckt ein „v". Es steht für vision. Der Weg von der Idee zur
              Marke: Vision wird zu Wahrnehmung, Wahrnehmung wird zur Marke. Das ist
              kein Detail im Logo, sondern das Prinzip, nach dem wir arbeiten.
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#E39832] mt-0.5 shrink-0" />
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
