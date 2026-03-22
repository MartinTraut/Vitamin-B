"use client"

import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowUpRight, X } from "lucide-react"

const projects = [
  {
    title: "Weingut Sonnenhof",
    category: "Branding & Webdesign",
    description: "Komplette Markenidentität und moderner Webauftritt für ein traditionsreiches Weingut aus der Region. Von der Logoentwicklung über das Corporate Design bis hin zur responsiven Website.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1400&q=80",
    results: ["Neue Markenidentität", "Responsive Website", "30% mehr Anfragen"],
    services: ["Logo Design", "Corporate Design", "Webentwicklung", "SEO"],
  },
  {
    title: "Autohaus Müller",
    category: "Corporate Design",
    description: "Premium Markenrelaunch für einen etablierten Automobilhändler in der Region. Modernisierung des gesamten Erscheinungsbilds bei gleichzeitiger Wahrung der über Jahrzehnte aufgebauten Markenbekanntheit.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80",
    results: ["Kompletter Markenrelaunch", "Neue Geschäftsausstattung", "Modernes Erscheinungsbild"],
    services: ["Brand Strategy", "Logo Redesign", "Print Design", "Fahrzeugbeschriftung"],
  },
  {
    title: "Café Goldene Zeit",
    category: "Print & Social Media",
    description: "Umfassendes Marketingkonzept mit Speisekarten, Flyern und Social Media Kampagnen. Das Café wurde innerhalb weniger Monate zum lokalen Hotspot.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=80",
    results: ["2.000+ neue Follower", "Umsatzsteigerung 25%", "Lokaler Hotspot"],
    services: ["Speisekarten Design", "Social Media", "Fotografie", "Flyer"],
  },
  {
    title: "TechStart GmbH",
    category: "Webdesign & Entwicklung",
    description: "Landingpage mit Fokus auf Conversion für ein innovatives Tech Startup. Performance optimiert und gebaut, um aus Besuchern zahlende Kunden zu machen.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
    results: ["40% höhere Conversion", "Ladezeit unter 1s", "Top SEO Rankings"],
    services: ["UI/UX Design", "Webentwicklung", "SEO", "Analytics"],
  },
  {
    title: "Fitness Studio IRON",
    category: "Branding & Marketing",
    description: "Markenstrategie, Innenraumgestaltung und digitale Kampagnen für ein Premium Fitnessstudio. Vom Logo bis zur Social Media Präsenz alles aus einem Guss.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80",
    results: ["Premium Markenauftritt", "500+ neue Mitglieder", "Social Media Wachstum"],
    services: ["Branding", "Innenraumdesign", "Social Media", "Kampagnen"],
  },
  {
    title: "Bäckerei Goldkruste",
    category: "Verpackungsdesign",
    description: "Moderne Verpackungsgestaltung und POS Materialien für eine traditionelle Bäckerei. Tradition trifft auf zeitgemäßes Design.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80",
    results: ["Neues Verpackungskonzept", "Stärkere Markenwahrnehmung", "Höhere Wiedererkennung"],
    services: ["Verpackungsdesign", "POS Material", "Produktfotografie", "Print"],
  },
]

function ProjectModal({ project, onClose }: { project: typeof projects[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl bg-[#0a0a0a] border border-white/[0.08] z-10 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 md:h-96 w-full overflow-hidden">
          <Image src={project.image} alt={project.title} fill className="object-cover" sizes="800px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
        </div>

        <div className="p-8 md:p-10 -mt-20 relative z-10">
          <span className="text-[#ff6a00] text-xs font-medium tracking-widest uppercase">{project.category}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {project.title}
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-8 max-w-2xl">{project.description}</p>

          <div className="mb-8">
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Ergebnisse</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {project.results.map((r) => (
                <div key={r} className="p-4 rounded-xl bg-[#ff6a00]/5 border border-[#ff6a00]/10">
                  <span className="text-white/70 text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Leistungen</h4>
            <div className="flex flex-wrap gap-2">
              {project.services.map((s) => (
                <span key={s} className="text-xs px-4 py-2 rounded-full bg-white/5 text-white/50 border border-white/5">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Portfolio() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef(null)
  const isInView = useInView(headerRef, { once: true, margin: "-100px" })
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Garage door: rotates from 55deg to 0 as you scroll, stays put
  const rotate = useTransform(scrollYProgress, [0, 0.6], [55, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.75, 1])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])

  return (
    <section id="portfolio" ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div ref={headerRef} className="max-w-7xl mx-auto px-6 mb-10 md:mb-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#ff6a00] text-sm font-medium tracking-widest uppercase mb-3 block"
          >
            Ausgewählte Arbeiten
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Projekte, die{" "}
            <span className="text-white/30">für sich sprechen.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white/40 text-base"
          >
            Klicken Sie auf ein Projekt, um alle Details zu sehen.
          </motion.p>
        </div>

        {/* 3D Card — garage door animation */}
        <div className="px-4 md:px-12 lg:px-20" style={{ perspective: "1200px" }}>
          <motion.div
            style={{
              rotateX: rotate,
              scale,
              opacity: cardOpacity,
              transformOrigin: "center top",
            }}
            className="max-w-6xl mx-auto"
          >
            <div className="rounded-[24px] md:rounded-[32px] border border-white/10 bg-[#111] p-3 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="rounded-2xl md:rounded-3xl bg-[#0a0a0a] p-3 md:p-5 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {projects.map((project, i) => (
                    <motion.div
                      key={project.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      onClick={() => setSelectedProject(project)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl cursor-pointer"
                    >
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        quality={80}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                      <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end">
                        <span className="text-[#ff6a00] text-[9px] md:text-xs font-medium tracking-wide uppercase mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          {project.category}
                        </span>
                        <h3 className="text-xs md:text-base font-bold text-white leading-tight">
                          {project.title}
                        </h3>
                      </div>

                      <div className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-9 md:h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 group-hover:bg-[#ff6a00]">
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
