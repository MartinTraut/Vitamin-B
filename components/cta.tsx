"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Phone, Mail, MapPin, Clock } from "lucide-react"

const WA_HREF =
  "https://wa.me/4915172896574?text=Hallo%20vitamin%20b%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Leistungen%20und%20h%C3%A4tte%20ein%20paar%20Fragen."

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

export function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="kontakt" className="relative py-16 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E39832]/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(227,152,50,0.06),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 lg:items-center">
          {/* Left: Info */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-4 block"
            >
              Kontakt
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Aus Ihrer Idee
              <br />
              <span className="gradient-text">wird eine Marke.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-white/50 text-lg leading-relaxed mb-10"
            >
              Erzählen Sie uns von Ihrem Vorhaben. Wir hören zu, ordnen ein und
              zeigen den Weg von der Vision zur Marke. Das Erstgespräch ist
              kostenlos und unverbindlich.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <a
                href="tel:+4915158779133"
                className="flex items-center gap-4 text-white/60 hover:text-[#E39832] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#E39832]/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">Telefon</div>
                  <div className="font-medium">+49 151 58779133</div>
                </div>
              </a>

              <a
                href="https://wa.me/4915172896574?text=Hallo%20vitamin%20b%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Leistungen%20und%20h%C3%A4tte%20ein%20paar%20Fragen."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-white/60 hover:text-[#E39832] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#E39832]/10 transition-colors">
                  <WhatsAppGlyph className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">WhatsApp</div>
                  <div className="font-medium">Direkt zum Chat</div>
                </div>
              </a>

              <a
                href="mailto:mail@vitaminb-design.de"
                className="flex items-center gap-4 text-white/60 hover:text-[#E39832] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#E39832]/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">E Mail</div>
                  <div className="font-medium">mail (at) vitaminb-design.de</div>
                </div>
              </a>

              <div className="flex items-center gap-4 text-white/60">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">Adresse</div>
                  <div className="font-medium">
                    Hermann Lang Str. 32, 74196 Neuenstadt a.K.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/60">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">Erreichbarkeit</div>
                  <div className="font-medium">Mo bis Fr: 9:00 bis 18:00 Uhr</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: WhatsApp Direct */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative flex flex-col p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-[radial-gradient(circle,rgba(37,211,102,0.12),transparent_70%)] pointer-events-none" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mb-7">
                  <WhatsAppGlyph className="w-8 h-8 text-[#25D366]" />
                </div>

                <h3
                  className="text-2xl md:text-3xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Schreiben Sie uns direkt
                </h3>
                <p className="text-white/50 leading-relaxed mb-8 max-w-md">
                  Kein Formular, kein Warten. Stellen Sie Ihre Frage einfach per
                  WhatsApp. Meist antworten wir noch am selben Tag (Mo bis Fr).
                </p>

                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-xl h-16 text-base md:text-lg font-semibold transition-colors"
                >
                  <WhatsAppGlyph className="w-6 h-6" />
                  Per WhatsApp anfragen
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>

                <p className="text-white/25 text-xs text-center mt-6">
                  Ihre Anfrage behandeln wir vertraulich. Mehr dazu in der{" "}
                  <a
                    href="/datenschutz"
                    className="underline underline-offset-2 hover:text-white/50 transition-colors"
                  >
                    Datenschutzerklärung
                  </a>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
