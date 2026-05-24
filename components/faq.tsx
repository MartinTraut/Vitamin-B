"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Ursprüngliche Online-Fragen (unverändert) plus ergänzende Punkte mit
// Orts-/Leistungsbezug für lokale Suche, GEO und KI-Antworten.
const faqs = [
  {
    question: "Was genau macht vitaminb?",
    answer:
      "vitaminb ist ein Creative Studio für Markenentwicklung aus Neuenstadt am Kocher. Ich entwickle Marken von der Strategie bis zum fertigen Auftritt: Branding und Corporate Design, Logo, Webdesign, Print, Social Media und Werbetechnik. Alles aus einer Hand, mit einem klaren Anspruch: From Vision to Brand.",
  },
  {
    question: "Wo sitzt vitaminb und welche Region betreut ihr?",
    answer:
      "Mein Studio ist in Neuenstadt am Kocher, im Landkreis Heilbronn. Ich arbeite für Unternehmen in der gesamten Region Heilbronn-Franken und im Hohenlohekreis, darunter Heilbronn, Öhringen, Bad Friedrichshall, Möckmühl, Neckarsulm, Bad Wimpfen und Künzelsau. Vieles läuft unkompliziert digital, ein Treffen vor Ort ist jederzeit möglich.",
  },
  {
    question: "Macht ihr auch Werbetechnik und Fahrzeugbeschriftung?",
    answer:
      "Ja. Neben Branding und Webdesign setze ich die Marke auch physisch um: Fahrzeugbeschriftung und Folierung, Schilder, Textildruck, Werbemittel und Geschäftsausstattung. Der Vorteil: Das Design bleibt vom Bildschirm bis zum Fahrzeug konsistent, weil alles aus einer Hand kommt. Auf Wunsch inklusive Montage vor Ort in der Region Heilbronn.",
  },
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
    question: "Arbeitet ihr auch mit Kunden außerhalb der Region Heilbronn?",
    answer:
      "Ja, ich arbeite mit Kunden in ganz Deutschland. Branding, Webdesign und Konzept lassen sich vollständig digital umsetzen, der Ablauf bleibt persönlich und direkt. Werbetechnik mit Montage vor Ort konzentriert sich auf die Region Heilbronn und den Hohenlohekreis.",
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
    "@id": "https://www.vitaminb-design.de/#faq",
    inLanguage: "de-DE",
    name: "Häufige Fragen zu vitaminb kommunikation & design",
    isPartOf: { "@id": "https://www.vitaminb-design.de" },
    about: {
      "@type": "ProfessionalService",
      name: "vitaminb kommunikation & design",
      areaServed: "Region Heilbronn-Franken, Hohenlohekreis",
    },
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
      <div className="max-w-4xl mx-auto px-5 md:px-6">
        <div ref={ref} className="text-center mb-10 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
            Fragen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sie fragen.
            <br />
            <span className="text-[#E39832]">Wir antworten.</span>
          </motion.h2>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15 + i * 0.05,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Accordion type="single" collapsible>
                <AccordionItem
                  value={`faq-${i}`}
                  className="border border-white/5 rounded-xl px-4 md:px-6 bg-white/[0.02] hover:border-[#E39832]/10 transition-colors duration-300 data-[state=open]:border-[#E39832]/20 data-[state=open]:bg-white/[0.03]"
                >
                  <AccordionTrigger className="gap-4 text-left text-white hover:text-[#E39832] transition-colors py-4 md:py-5 text-[15px] md:text-base font-medium [&>svg]:text-[#E39832] [&>svg]:transition-transform [&>svg]:duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/50 text-sm md:text-[15px] leading-relaxed pb-4 md:pb-5">
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
