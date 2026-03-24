"use client"

import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
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
    description: "Premium Markenrelaunch für einen etablierten Automobilhändler in der Region.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80",
    results: ["Kompletter Markenrelaunch", "Neue Geschäftsausstattung", "Modernes Erscheinungsbild"],
    services: ["Brand Strategy", "Logo Redesign", "Print Design", "Fahrzeugbeschriftung"],
  },
  {
    title: "Café Goldene Zeit",
    category: "Print & Social Media",
    description: "Umfassendes Marketingkonzept mit Speisekarten, Flyern und Social Media Kampagnen.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=80",
    results: ["2.000+ neue Follower", "Umsatzsteigerung 25%", "Lokaler Hotspot"],
    services: ["Speisekarten Design", "Social Media", "Fotografie", "Flyer"],
  },
  {
    title: "TechStart GmbH",
    category: "Webdesign & Entwicklung",
    description: "Landingpage mit Fokus auf Conversion für ein innovatives Tech Startup.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
    results: ["40% höhere Conversion", "Ladezeit unter 1s", "Top SEO Rankings"],
    services: ["UI/UX Design", "Webentwicklung", "SEO", "Analytics"],
  },
  {
    title: "Fitness Studio IRON",
    category: "Branding & Marketing",
    description: "Markenstrategie, Innenraumgestaltung und digitale Kampagnen für ein Premium Fitnessstudio.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80",
    results: ["Premium Markenauftritt", "500+ neue Mitglieder", "Social Media Wachstum"],
    services: ["Branding", "Innenraumdesign", "Social Media", "Kampagnen"],
  },
  {
    title: "Bäckerei Goldkruste",
    category: "Verpackungsdesign",
    description: "Moderne Verpackungsgestaltung und POS Materialien für eine traditionelle Bäckerei.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80",
    results: ["Neues Verpackungskonzept", "Stärkere Markenwahrnehmung", "Höhere Wiedererkennung"],
    services: ["Verpackungsdesign", "POS Material", "Produktfotografie", "Print"],
  },
]

function ProjectModal({ project, onClose }: { project: typeof projects[0]; onClose: () => void }) {
  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:max-w-4xl max-h-[92vh] md:max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-[#0a0a0a] border border-white/[0.08] z-10"
      >
        {/* Drag handle mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative h-48 md:h-80 w-full overflow-hidden md:rounded-t-3xl">
          <Image src={project.image} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
        </div>

        <div className="p-5 md:p-10 -mt-12 md:-mt-20 relative z-10">
          <span className="text-[#ff6a00] text-[10px] md:text-xs font-medium tracking-widest uppercase">{project.category}</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mt-1 mb-3 md:mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {project.title}
          </h2>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mb-6 md:mb-8">{project.description}</p>

          <div className="mb-6 md:mb-8">
            <h4 className="text-white text-xs font-semibold mb-3 uppercase tracking-wider">Ergebnisse</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {project.results.map((r) => (
                <div key={r} className="p-3 md:p-4 rounded-xl bg-[#ff6a00]/5 border border-[#ff6a00]/10">
                  <span className="text-white/70 text-xs md:text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-4">
            <h4 className="text-white text-xs font-semibold mb-3 uppercase tracking-wider">Leistungen</h4>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {project.services.map((s) => (
                <span key={s} className="text-[10px] md:text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/5">{s}</span>
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Mobile: less dramatic animation, Desktop: full garage door
  const rotate = useTransform(scrollYProgress, [0, 0.6], isMobile ? [25, 0] : [55, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], isMobile ? [0.9, 1] : [0.75, 1])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])

  return (
    <section id="portfolio" ref={sectionRef} className="relative" style={{ height: isMobile ? "200vh" : "300vh" }}>
      <div className="sticky top-0 h-[100svh] flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div ref={headerRef} className="max-w-7xl mx-auto px-5 md:px-6 mb-6 md:mb-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#ff6a00] text-xs md:text-sm font-medium tracking-widest uppercase mb-2 md:mb-3 block"
          >
            Ausgewählte Arbeiten
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-white">Projekte,</span>{" "}
            <span className="text-white/30">die für sich sprechen.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white/40 text-sm md:text-base hidden md:block"
          >
            Klicken Sie auf ein Projekt, um alle Details zu sehen.
          </motion.p>
        </div>

        {/* 3D Card */}
        <div className="px-3 md:px-12 lg:px-20" style={{ perspective: "1200px" }}>
          <motion.div
            style={{
              rotateX: rotate,
              scale,
              opacity: cardOpacity,
              transformOrigin: "center top",
            }}
            className="max-w-6xl mx-auto"
          >
            <div className="rounded-2xl md:rounded-[32px] border border-white/10 bg-[#111] p-2 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="rounded-xl md:rounded-3xl bg-[#0a0a0a] p-2 md:p-5 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-3">
                  {projects.map((project, i) => (
                    <div
                      key={project.title}
                      onClick={() => setSelectedProject(project)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        quality={75}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 md:opacity-60 md:group-hover:opacity-90 transition-opacity duration-500" />

                      <div className="absolute inset-0 p-2.5 md:p-4 flex flex-col justify-end">
                        <span className="text-[#ff6a00] text-[8px] md:text-xs font-medium tracking-wide uppercase mb-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {project.category}
                        </span>
                        <h3 className="text-[11px] md:text-base font-bold text-white leading-tight">
                          {project.title}
                        </h3>
                      </div>

                      <div className="absolute top-2 right-2 w-6 h-6 md:w-9 md:h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100 transition-all md:group-hover:bg-[#ff6a00]">
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
