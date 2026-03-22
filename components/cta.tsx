"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Phone, Mail, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="kontakt" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6a00]/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,106,0,0.06),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Info */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
            >
              Kontakt
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Lassen Sie uns
              <br />
              <span className="gradient-text">zusammen wachsen.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-white/50 text-lg leading-relaxed mb-10"
            >
              Bereit, Ihre Marke auf das nächste Level zu bringen? Erzählen Sie uns
              von Ihrem Projekt. Das Erstgespräch ist natürlich kostenlos und
              unverbindlich.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <a
                href="tel:+4915172896574"
                className="flex items-center gap-4 text-white/60 hover:text-[#ff6a00] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#ff6a00]/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">Telefon</div>
                  <div className="font-medium">+49 (0) 151 72 89 65 74</div>
                </div>
              </a>

              <a
                href="mailto:mail@vitaminb-design.de"
                className="flex items-center gap-4 text-white/60 hover:text-[#ff6a00] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#ff6a00]/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-white/30 mb-1">E Mail</div>
                  <div className="font-medium">mail@vitaminb-design.de</div>
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

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <form className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/60 text-sm">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ihr Name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#ff6a00]/50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/60 text-sm">
                    E Mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre@email.de"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#ff6a00]/50 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-white/60 text-sm">
                  Unternehmen
                </Label>
                <Input
                  id="company"
                  placeholder="Ihr Unternehmen"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#ff6a00]/50 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service" className="text-white/60 text-sm">
                  Gewünschte Leistung
                </Label>
                <select
                  id="service"
                  className="w-full h-12 rounded-md bg-white/5 border border-white/10 text-white/60 px-3 focus:border-[#ff6a00]/50 focus:outline-none transition-colors"
                >
                  <option value="" className="bg-[#0d0d0d]">Bitte wählen...</option>
                  <option value="branding" className="bg-[#0d0d0d]">Branding & Corporate Design</option>
                  <option value="webdesign" className="bg-[#0d0d0d]">Webdesign & Entwicklung</option>
                  <option value="print" className="bg-[#0d0d0d]">Print & Drucksachen</option>
                  <option value="social" className="bg-[#0d0d0d]">Social Media</option>
                  <option value="foto" className="bg-[#0d0d0d]">Fotografie & Video</option>
                  <option value="beratung" className="bg-[#0d0d0d]">Marketing & Beratung</option>
                  <option value="sonstiges" className="bg-[#0d0d0d]">Sonstiges</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/60 text-sm">
                  Ihre Nachricht *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Erzählen Sie uns von Ihrem Projekt..."
                  rows={5}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#ff6a00]/50 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#ff6a00] hover:bg-[#ff8c33] text-white rounded-xl h-14 text-base font-medium group"
              >
                Nachricht senden
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <p className="text-white/20 text-xs text-center">
                Wir melden uns innerhalb von 24 Stunden bei Ihnen zurück.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
