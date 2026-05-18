"use client"

import { motion, useScroll, useTransform, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { ArrowUpRight, X, ChevronLeft, ChevronRight, Plus } from "lucide-react"

const projects: {
  title: string
  category: string
  description: string
  image: string
  results: string[]
  services: string[]
  imagePosition?: string
  imageContain?: boolean
  cardScaleClass?: string
  gallery?: { src: string; position?: string }[]
  placeholder?: boolean
}[] = [
  {
    title: "Ihr Projekt",
    category: "Demnächst hier",
    description: "",
    image: "",
    placeholder: true,
    results: [],
    services: [],
  },
  {
    title: "FIRMfit Mobiler Showroom",
    category: "Fahrzeugflotte & Werbetechnik",
    description: "Ein durchgängiger Markenauftritt auf der Straße für FIRMfit Fitness Leasing. Transporter und Anhänger bilden einen mobilen Showroom, der die Trainingswelt direkt zum Kunden bringt. Die Heckgestaltung des Vans transportiert das Leistungsversprechen auf einen Blick. Sauber foliert, über die gesamte Flotte hinweg konsistent und auf jeder Strecke sofort wiedererkennbar.",
    image: "/projekt-fitnessleasing-gespann.jpg",
    cardScaleClass: "scale-[1.35] group-hover:scale-[1.45]",
    gallery: [
      { src: "/projekt-fitnessleasing-gespann.jpg", position: "center" },
      { src: "/projekt-fitnessleasing-van.jpg", position: "center 38%" },
    ],
    results: ["Mobiler Showroom auf Rädern", "Einheitliche Flottengestaltung", "Hohe Wiedererkennung im Straßenbild"],
    services: ["Fahrzeugfolierung", "Anhängerfolierung", "Heckgestaltung", "Werbetechnik", "Montage"],
  },
  {
    title: "Café Goldene Zeit",
    category: "Print & Social Media",
    description: "Eine durchgängige visuelle Sprache vom Menü bis zum Social Feed. Konsistent gedacht, damit das Café wiedererkannt wird.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=80",
    results: ["2.000+ neue Follower", "Umsatzsteigerung 25%", "Lokaler Hotspot"],
    services: ["Speisekarten Design", "Social Media", "Fotografie", "Flyer"],
  },
  {
    title: "TechStart GmbH",
    category: "Webdesign & Entwicklung",
    description: "Ein digitaler Auftritt, der in Sekunden verständlich ist. Klar strukturiert und darauf gebaut, Besucher zu führen.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
    results: ["40% höhere Conversion", "Ladezeit unter 1s", "Top SEO Rankings"],
    services: ["UI/UX Design", "Webentwicklung", "SEO", "Analytics"],
  },
  {
    title: "Fitness Studio IRON",
    category: "Branding & Marketing",
    description: "Eine Premium-Positionierung, die sich durchzieht. Von der Markenstrategie über den Raum bis in die digitale Kommunikation.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80",
    results: ["Premium Markenauftritt", "500+ neue Mitglieder", "Social Media Wachstum"],
    services: ["Branding", "Innenraumdesign", "Social Media", "Kampagnen"],
  },
  {
    title: "KUHN Performance",
    category: "Fahrzeugbeschriftung & Branding",
    description: "Die Marke fährt mit. Ein klares Beschriftungskonzept auf dem Fahrzeug. Präzise foliert, im Einklang mit dem Erscheinungsbild und auf der Straße sofort erkennbar.",
    image: "/PHOTO-2026-05-18-02-57-23.jpg",
    imagePosition: "center 60%",
    results: ["Markante Fahrzeugbeschriftung", "Konsistentes Erscheinungsbild", "Hohe Wiedererkennung"],
    services: ["Fahrzeugfolierung", "Werbetechnik", "Logo Anwendung", "Montage"],
  },
]

function ModalGallery({
  images,
  alt,
  heightClass,
}: {
  images: { src: string; position?: string }[]
  alt: string
  heightClass: string
}) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)

  const go = (next: number) => {
    setDir(next > index ? 1 : -1)
    setIndex((next + images.length) % images.length)
  }

  return (
    <div className={`relative w-full overflow-hidden md:rounded-t-3xl bg-[#0a0a0a] ${heightClass}`}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={index}
          custom={dir}
          initial={{ opacity: 0, x: dir >= 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir >= 0 ? -60 : 60 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(index + 1)
            else if (info.offset.x > 60) go(index - 1)
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <Image
            src={images[index].src}
            alt={alt}
            fill
            className="object-cover pointer-events-none select-none"
            style={{ objectPosition: images[index].position ?? "center" }}
            sizes="(max-width: 768px) 100vw, 900px"
            quality={92}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent pointer-events-none" />

      <button
        onClick={() => go(index - 1)}
        aria-label="Vorheriges Bild"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-[#E39832] transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Nächstes Bild"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-[#E39832] transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Bild ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-[#E39832]" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

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
        className="relative w-full md:max-w-3xl max-h-[92vh] md:max-h-[88vh] overflow-hidden rounded-t-3xl md:rounded-3xl bg-[#0a0a0a] border border-white/[0.08] z-10"
      >
        {/* Drag handle mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#E39832] shadow-lg shadow-black/30 flex items-center justify-center text-white hover:brightness-110 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {project.gallery && project.gallery.length > 1 ? (
          <ModalGallery
            images={project.gallery}
            alt={project.title}
            heightClass={project.imageContain ? "h-60 md:h-80" : "h-44 md:h-64"}
          />
        ) : (
          <div
            className={`relative w-full overflow-hidden md:rounded-t-3xl bg-[#0a0a0a] ${
              project.imageContain ? "h-60 md:h-80" : "h-44 md:h-64"
            }`}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className={project.imageContain ? "object-contain" : "object-cover"}
              style={{ objectPosition: project.imageContain ? "center" : project.imagePosition ?? "center" }}
              sizes="(max-width: 768px) 100vw, 900px"
              quality={92}
            />
            {!project.imageContain && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
            )}
          </div>
        )}

        <div className="p-5 md:p-8 -mt-12 md:-mt-16 relative z-10">
          <span className="text-[#E39832] text-[10px] md:text-xs font-medium tracking-widest uppercase">{project.category}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-1 mb-2 md:mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            {project.title}
          </h2>
          <p className="text-white/50 text-sm md:text-[15px] leading-relaxed mb-4 md:mb-6">{project.description}</p>

          <div className="mb-4 md:mb-6">
            <h4 className="text-white text-xs font-semibold mb-2 uppercase tracking-wider">Ergebnisse</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {project.results.map((r) => (
                <div key={r} className="p-3 md:p-4 rounded-xl bg-[#E39832]/5 border border-[#E39832]/10">
                  <span className="text-white/70 text-xs md:text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-4">
            <h4 className="text-white text-xs font-semibold mb-2 uppercase tracking-wider">Leistungen</h4>
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

  // Scroll-Progress federn -> kein hartes 1:1-Mapping, sondern flüssige,
  // leicht nachlaufende Bewegung (smoother Reveal statt ruckeligem Scrub)
  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    mass: 0.5,
  })

  // Mobile: kein 3D (kein perspektivisches Re-Rastern pro Frame -> smooth)
  // Desktop: cinematischer, an den gefederten Scroll gekoppelter Reveal:
  //  - 3D-Aufrichten aus der Tiefe
  //  - leichtes Hochfahren + Skalieren
  //  - sanftes Blur-to-clear (Fokus zieht scharf)
  const rotate = useTransform(smooth, [0, 0.7], isMobile ? [0, 0] : [16, 0])
  const scale = useTransform(smooth, [0, 0.82], isMobile ? [0.97, 1] : [0.84, 1])
  const y = useTransform(smooth, [0, 0.82], isMobile ? [0, 0] : [70, 0])
  const cardOpacity = useTransform(smooth, [0, 0.12], [0, 1])
  const blurPx = useTransform(smooth, [0, 0.55], isMobile ? [0, 0] : [14, 0])
  const filter = useMotionTemplate`blur(${blurPx}px)`

  const cards = projects.map((project) =>
    project.placeholder ? (
      <div
        key={project.title}
        className="group relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-2xl border border-dashed border-white/10 bg-white/[0.015]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(227,152,50,0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-[#E39832]/30 bg-[#E39832]/10 flex items-center justify-center mb-2 md:mb-3">
            <Plus className="w-4 h-4 md:w-5 md:h-5 text-[#E39832]" />
          </div>
          <span className="text-[#E39832] text-[8px] md:text-xs font-medium tracking-wide uppercase mb-0.5">
            {project.category}
          </span>
          <h3 className="text-[11px] md:text-base font-bold text-white leading-tight">
            {project.title}
          </h3>
          <p className="hidden md:block text-white/35 text-xs mt-1.5 max-w-[14rem]">
            Wird hier Ihr nächstes Projekt stehen?
          </p>
        </div>
      </div>
    ) : (
      <div
        key={project.title}
        onClick={() => setSelectedProject(project)}
        className="group relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
      >
      <Image
        src={project.image}
        alt={project.title}
        fill
        className={`object-cover transition-transform duration-700 ${project.cardScaleClass ?? "group-hover:scale-110"}`}
        style={{ objectPosition: project.imagePosition ?? "center" }}
        sizes="(max-width: 768px) 50vw, 33vw"
        quality={82}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-55 md:opacity-45 md:group-hover:opacity-75 transition-opacity duration-500" />
      <div className="absolute inset-0 p-2.5 md:p-4 flex flex-col justify-end">
        <span className="text-[#E39832] text-[8px] md:text-xs font-medium tracking-wide uppercase mb-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {project.category}
        </span>
        <h3 className="text-[11px] md:text-base font-bold text-white leading-tight">
          {project.title}
        </h3>
      </div>
      <div className="absolute top-2 right-2 w-6 h-6 md:w-9 md:h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center md:opacity-0 md:scale-75 md:group-hover:opacity-100 md:group-hover:scale-100 transition-all md:group-hover:bg-[#E39832]">
        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
      </div>
      </div>
    )
  )

  if (isMobile) {
    return (
      <section id="portfolio" className="relative py-16">
        <div className="max-w-7xl mx-auto px-5 text-center mb-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-[#E39832] text-xs font-medium tracking-widest uppercase mb-2 block"
          >
            Arbeiten
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.05, duration: 0.6 }}
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-white">Wirkung,</span>{" "}
            <span className="text-white/30">die man sieht.</span>
          </motion.h2>
          <p className="text-white/40 text-sm">
            Ein Projekt antippen und die Details ansehen.
          </p>
        </div>

        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#111] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="rounded-xl bg-[#0a0a0a] p-2 overflow-hidden">
              <div className="grid grid-cols-2 gap-1.5">{cards}</div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedProject && (
            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
          )}
        </AnimatePresence>
      </section>
    )
  }

  return (
    <section id="portfolio" ref={sectionRef} className="relative" style={{ height: "230vh" }}>
      <div className="sticky top-0 h-[100svh] flex flex-col justify-center overflow-hidden pt-14 md:pt-16 pb-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-5 md:px-6 mb-3 md:mb-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-[#E39832] text-xs md:text-sm font-medium tracking-widest uppercase mb-1.5 md:mb-2 block"
          >
Arbeiten
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-1.5 md:mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-white">Wirkung,</span>{" "}
            <span className="text-white/30">die man sieht.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white/40 text-sm md:text-base hidden md:block"
          >
Ein Projekt auswählen und die Details ansehen.
          </motion.p>
        </div>

        {/* 3D Card */}
        <div className="px-3 md:px-8 lg:px-12" style={{ perspective: "1700px" }}>
          <motion.div
            style={{
              rotateX: rotate,
              scale,
              y,
              opacity: cardOpacity,
              filter,
              transformOrigin: "center top",
              willChange: "transform, opacity, filter",
            }}
            className="max-w-5xl mx-auto"
          >
            <div className="rounded-2xl md:rounded-[36px] border border-white/10 bg-[#1c1c1c] p-2.5 md:p-4 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)]">
              <div className="rounded-xl md:rounded-[28px] bg-[#151515] p-2.5 md:p-3 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {cards}
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
