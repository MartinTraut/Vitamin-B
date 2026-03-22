"use client"

import { motion } from "framer-motion"

const words = [
  "BRANDING",
  "WEBDESIGN",
  "PRINT",
  "SOCIAL MEDIA",
  "FOTOGRAFIE",
  "STRATEGIE",
  "MARKETING",
  "CORPORATE DESIGN",
  "UI/UX",
  "KREATIVITÄT",
]

export function Marquee() {
  return (
    <div className="relative py-12 overflow-hidden border-y border-white/5">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />

      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...words, ...words, ...words].map((word, i) => (
          <span
            key={i}
            className="text-3xl md:text-5xl font-bold text-white/[0.03] flex items-center gap-8"
          >
            {word}
            <span className="w-2 h-2 rounded-full bg-[#ff6a00]/20" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
