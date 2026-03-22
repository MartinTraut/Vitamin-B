"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Thomas Schneider",
    role: "Geschäftsführer, Autohaus Schneider",
    text: "vitamin b hat unsere komplette Marke neu aufgestellt. Von der Website bis zu den Printmaterialien — alles wie aus einem Guss. Unsere Kunden sind begeistert, und wir haben spürbar mehr Anfragen seit dem Relaunch.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    name: "Sarah Weber",
    role: "Inhaberin, Café Goldene Zeit",
    text: "Ich war skeptisch, ob sich professionelles Design für ein kleines Café lohnt. Heute weiß ich: Es war die beste Investition überhaupt. Die Social-Media-Kampagne hat uns über 2.000 neue Follower gebracht.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
  },
  {
    name: "Michael Kraft",
    role: "CEO, TechStart GmbH",
    text: "Professionell, kreativ und immer pünktlich. Die Zusammenarbeit mit Robert und seinem Team war von Anfang an unkompliziert. Die neue Landing Page hat unsere Conversion-Rate um 40% gesteigert.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  },
]

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
          >
            Kundenstimmen
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Was unsere Kunden
            <br />
            <span className="text-white/30">über uns sagen.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="relative group"
            >
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ff6a00]/10 transition-all duration-500 h-full flex flex-col">
                <Quote className="w-10 h-10 text-[#ff6a00]/20 mb-6" />

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-[#ff6a00] fill-[#ff6a00]"
                    />
                  ))}
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-8 flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <div
                    className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-[#ff6a00]/20"
                    style={{ backgroundImage: `url(${testimonial.image})` }}
                  />
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
