"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Thomas Schneider",
    role: "Geschäftsführer, Autohaus Schneider",
    text: "vitaminb hat unsere komplette Marke neu aufgestellt. Von der Website bis zu den Printmaterialien, alles wie aus einem Guss. Unsere Kunden sind begeistert und wir haben spürbar mehr Anfragen seit dem Relaunch.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    name: "Sarah Weber",
    role: "Inhaberin, Café Goldene Zeit",
    text: "Ich war skeptisch, ob sich professionelles Design für ein kleines Café lohnt. Heute weiß ich: Es war die beste Investition überhaupt. Die Social Media Kampagne hat uns über 2.000 neue Follower gebracht.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
  },
  {
    name: "Michael Kraft",
    role: "CEO, TechStart GmbH",
    text: "Professionell, kreativ und immer pünktlich. Die Zusammenarbeit mit Robert und seinem Team war von Anfang an unkompliziert. Die neue Landing Page hat unsere Conversion Rate um 40% gesteigert.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  },
]

export function Testimonials() {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
Stimmen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-white">Wirkung,</span>{" "}
            <span className="text-white/30">die bestätigt wird.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -6 }}
              className="relative group"
            >
              <div className="hover-glow hover-aura p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#E39832]/30 transition-all duration-500 h-full flex flex-col group-hover:shadow-[0_0_40px_rgba(227,152,50,0.08)]">
                <motion.div
                  initial={{ opacity: 0, rotate: -10 }}
                  whileInView={{ opacity: 1, rotate: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
                >
                  <Quote className="w-10 h-10 text-[#E39832]/20 mb-6 group-hover:text-[#E39832]/30 transition-colors duration-500" />
                </motion.div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0, rotate: -60 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        delay: 0.3 + i * 0.12 + j * 0.09,
                        type: "spring",
                        stiffness: 380,
                        damping: 20,
                      }}
                      whileHover={{ scale: 1.25, rotate: 12 }}
                    >
                      <Star className="w-4 h-4 text-[#E39832] fill-[#E39832] drop-shadow-[0_0_6px_rgba(227,152,50,0.5)]" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-8 flex-1 group-hover:text-white/70 transition-colors duration-500">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#E39832]/20 shrink-0 group-hover:border-[#E39832]/40 transition-colors duration-500">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-white/40 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
