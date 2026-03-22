"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { MessageSquare, Lightbulb, Pen, Rocket } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Erstgespräch",
    description:
      "In einem kostenlosen Erstgespräch lernen wir Ihr Unternehmen kennen, verstehen Ihre Ziele und definieren den Projektrahmen. Kein Verkaufsdruck — nur echtes Interesse.",
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Konzept & Strategie",
    description:
      "Wir analysieren Ihre Branche, Ihre Zielgruppe und Ihre Mitbewerber. Daraus entwickeln wir ein maßgeschneidertes Konzept, das Ihre Marke einzigartig positioniert.",
  },
  {
    number: "03",
    icon: Pen,
    title: "Design & Umsetzung",
    description:
      "Jetzt wird's kreativ. Wir gestalten, programmieren und verfeinern — immer in enger Abstimmung mit Ihnen. Sie erhalten regelmäßige Updates und können jederzeit Feedback geben.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Launch & Support",
    description:
      "Go live! Wir begleiten den Launch und stehen Ihnen auch danach als langfristiger Partner zur Seite. Weil gutes Design Pflege braucht.",
  },
]

export function Process() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="prozess" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
            Unser Prozess
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Vier Schritte zu
            <br />
            <span className="text-white/30">Ihrem Traumdesign.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg"
          >
            Ein erprobter Prozess, der sicherstellt, dass jedes Projekt pünktlich,
            im Budget und in höchster Qualität abgeliefert wird.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-[1px] bg-gradient-to-r from-transparent via-[#ff6a00]/20 to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className="relative text-center group"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ff6a00]/10 border border-[#ff6a00]/20 mb-8 group-hover:bg-[#ff6a00]/20 transition-colors duration-500">
                  <Icon className="w-7 h-7 text-[#ff6a00]" />
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#ff6a00] text-white text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
