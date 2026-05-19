"use client"

import { motion } from "framer-motion"
import { Instagram, ArrowUpRight } from "lucide-react"

const IG_HREF = "https://www.instagram.com/vitaminb_design/"

export function PortfolioInstagram() {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/[0.07] bg-white/[0.02]"
        >
          {/* Instagram-Gradient als ruhiger Akzent */}
          <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(214,41,118,0.18),transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(79,91,213,0.14),transparent_70%)] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 p-7 md:p-12">
            <div className="max-w-xl">
              <span className="text-[#E39832] text-xs md:text-sm font-medium tracking-widest uppercase mb-3 block">
                Mehr Arbeiten
              </span>
              <h2
                className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Auf Instagram zeigen wir mehr.
              </h2>
              <p className="text-white/50 text-sm md:text-base leading-relaxed">
                Laufend neue Kundenprojekte, Einblicke in die Umsetzung und
                Markenmomente aus der Region. Folgen Sie uns und sehen Sie, wie
                aus Visionen Marken werden.
              </p>
            </div>

            <a
              href={IG_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="vitaminb auf Instagram ansehen"
              className="group relative inline-flex shrink-0 items-center gap-3 rounded-xl px-6 py-4 font-semibold text-white bg-[linear-gradient(135deg,#feda75_0%,#fa7e1e_25%,#d62976_55%,#962fbf_80%,#4f5bd5_100%)] shadow-[0_0_26px_-4px_rgba(214,41,118,0.6)] transition-transform duration-300 hover:scale-[1.04] hover:shadow-[0_0_34px_-2px_rgba(214,41,118,0.85)]"
            >
              <span className="absolute inset-0 rounded-xl bg-[linear-gradient(135deg,#feda75,#d62976,#4f5bd5)] blur-md opacity-45 group-hover:opacity-75 transition-opacity -z-10" />
              <Instagram className="w-5 h-5" />
              vitaminb auf Instagram
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
