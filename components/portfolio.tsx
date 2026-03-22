"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight } from "lucide-react"

const projects = [
  {
    title: "Weingut Sonnenhof",
    category: "Branding & Webdesign",
    description: "Komplette Markenidentität und moderner Webauftritt für ein traditionsreiches Weingut.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
    size: "large",
  },
  {
    title: "Autohaus Müller",
    category: "Corporate Design",
    description: "Premium Brand-Refresh für einen etablierten Automobilhändler in der Region.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
    size: "small",
  },
  {
    title: "Café Goldene Zeit",
    category: "Print & Social Media",
    description: "Umfassendes Marketingkonzept mit Speisekarten, Flyern und Social-Media-Kampagnen.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    size: "small",
  },
  {
    title: "TechStart GmbH",
    category: "Webdesign & Entwicklung",
    description: "Conversion-optimierte Landingpage für ein innovatives Tech-Startup.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    size: "small",
  },
  {
    title: "Fitness Studio IRON",
    category: "Branding & Marketing",
    description: "Markenstrategie, Innenraumgestaltung und digitale Kampagnen für ein Premium-Fitnessstudio.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    size: "large",
  },
  {
    title: "Bäckerei Goldkruste",
    category: "Verpackungsdesign",
    description: "Moderne Verpackungsgestaltung und POS-Materialien für eine traditionelle Bäckerei.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    size: "small",
  },
]

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
        project.size === "large" ? "md:col-span-2 aspect-[2/1]" : "aspect-[4/3]"
      }`}
    >
      {/* Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${project.image})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <span className="text-[#ff6a00] text-sm font-medium tracking-wide uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {project.category}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {project.title}
          </h3>
          <p className="text-white/60 text-sm max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            {project.description}
          </p>
        </div>

        <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:bg-[#ff6a00]">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export function Portfolio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="portfolio" className="relative py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-4 block"
            >
              Ausgewählte Arbeiten
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Projekte, die
              <br />
              <span className="text-white/30">für sich sprechen.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/50 max-w-md text-lg"
          >
            Jedes Projekt ist einzigartig. Sehen Sie selbst, was wir für unsere Kunden
            geschaffen haben.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
