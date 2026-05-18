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
    question: "Was kostet die Zusammenarbeit?",
    answer:
      "Jedes Projekt ist anders, deshalb nenne ich keinen pauschalen Preis. Was es kostet, hängt von Umfang, Anspruch und Ihren Zielen ab. Im kostenlosen Erstgespräch schaue ich mir Ihr Vorhaben in Ruhe an. Danach bekommen Sie ein individuelles, transparentes Angebot. Ohne versteckte Kosten und ohne Verpflichtung.",
  },
  {
    question: "Wie lange dauert ein Projekt?",
    answer:
      "Das hängt vom Vorhaben ab. Eine Marke entsteht nicht über Nacht, soll aber auch nicht ewig dauern. Den realistischen Zeitrahmen bespreche ich mit Ihnen vorab und halte mich daran. Sie wissen jederzeit, woran wir gerade arbeiten.",
  },
  {
    question: "Arbeiten Sie auch mit Kunden außerhalb der Region?",
    answer:
      "Mein Studio ist in Neuenstadt am Kocher in der Region Heilbronn. Ich arbeite mit Kunden in ganz Deutschland, vieles läuft unkompliziert digital. Wenn Sie ein persönliches Treffen möchten, machen wir das möglich.",
  },
  {
    question: "Was brauchen Sie von mir, um loszulegen?",
    answer:
      "Zuerst nur ein Gespräch. Ich stelle die richtigen Fragen, um Sie, Ihr Unternehmen und Ihr Ziel zu verstehen. Vorhandenes Material wie Logo, Texte oder Fotos hilft, ist aber kein Muss. Den Rest erarbeiten wir gemeinsam.",
  },
  {
    question: "Begleiten Sie die Marke auch nach dem Projekt?",
    answer:
      "Ja, gerne. Viele Kunden bleiben danach bei mir, für Pflege, neue Drucksachen, Social Media oder wenn etwas Neues ansteht. So bleibt Ihre Marke konsistent und Sie haben einen festen Ansprechpartner statt wechselnder Zuständigkeiten.",
  },
  {
    question: "Warum vitaminb und nicht eine große Agentur?",
    answer:
      "Bei mir sind Sie kein Vorgang in einem System. Sie sprechen direkt mit der Person, die gestaltet und produziert. Kurze Wege, ehrliche Einschätzung, ein Anspruch von der Strategie bis zum fertigen Produkt. Persönlich, nicht anonym.",
  },
]

export function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <section id="faq" className="relative py-16 md:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
Fragen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sie fragen.
            <br />
            <span className="text-white/30">Wir antworten.</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Accordion type="single" collapsible>
                <AccordionItem
                  value={`faq-${i}`}
                  className="border border-white/5 rounded-xl px-6 bg-white/[0.02] hover:border-[#E39832]/10 transition-all duration-500 data-[state=open]:border-[#E39832]/20 data-[state=open]:bg-white/[0.03]"
                >
                  <AccordionTrigger className="text-left text-white hover:text-[#E39832] transition-colors py-5 text-base font-medium [&>svg]:text-[#E39832] [&>svg]:transition-transform [&>svg]:duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/50 leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
