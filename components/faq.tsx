"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Was kostet ein Projekt bei vitamin b?",
    answer:
      "Jedes Projekt ist individuell — genau wie unsere Preise. Ein Logo-Design startet ab 990€, eine Website ab 2.490€. Im kostenlosen Erstgespräch besprechen wir Ihre Wünsche und erstellen ein transparentes Angebot ohne versteckte Kosten.",
  },
  {
    question: "Wie lange dauert ein typisches Projekt?",
    answer:
      "Ein Logo-Projekt dauert in der Regel 2-3 Wochen, eine Website 4-8 Wochen, ein komplettes Corporate Design 4-6 Wochen. Wir besprechen den Zeitrahmen immer vorab und halten uns daran.",
  },
  {
    question: "Arbeitet ihr auch mit Kunden außerhalb der Region?",
    answer:
      "Absolut! Obwohl wir in Neuenstadt am Kocher bei Heilbronn sitzen, arbeiten wir dank moderner Kommunikation mit Kunden in ganz Deutschland und darüber hinaus. Persönliche Treffen sind natürlich auch möglich.",
  },
  {
    question: "Was braucht ihr von mir, um loszulegen?",
    answer:
      "Im ersten Schritt nur Ihre Zeit für ein Gespräch. Wir stellen die richtigen Fragen, um Ihr Unternehmen und Ihre Ziele zu verstehen. Vorhandene Materialien (Logo, Texte, Fotos) sind hilfreich, aber nicht zwingend erforderlich.",
  },
  {
    question: "Bietet ihr auch laufende Betreuung an?",
    answer:
      "Ja! Viele unserer Kunden nutzen unsere monatlichen Betreuungspakete für Website-Pflege, Social-Media-Content oder laufendes Grafikdesign. So haben Sie immer einen kreativen Partner an Ihrer Seite.",
  },
  {
    question: "Warum vitamin b und nicht eine große Agentur?",
    answer:
      "Bei uns sind Sie kein Ticket in einem System. Sie arbeiten direkt mit dem Gründer und erfahrenen Designern — ohne Umwege, ohne Aufpreis. Das Ergebnis: Schnellere Kommunikation, mehr Flexibilität und Design auf Premium-Niveau zu fairen Konditionen.",
  },
]

export function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="faq" className="relative py-32">
      <div className="max-w-4xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
            Häufige Fragen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sie fragen.
            <br />
            <span className="text-white/30">Wir antworten.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-white/5 rounded-xl px-6 bg-white/[0.02] hover:border-[#ff6a00]/10 transition-colors data-[state=open]:border-[#ff6a00]/20"
              >
                <AccordionTrigger className="text-left text-white hover:text-[#ff6a00] transition-colors py-5 text-base font-medium [&>svg]:text-[#ff6a00]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/50 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
