"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionValue } from "framer-motion"
import { MessageSquare, Lightbulb, Pen, Truck, CheckCircle2, Clock, Target, Zap, Heart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Erstgespräch",
    subtitle: "Kennenlernen",
    description: "Sie sprechen direkt mit Robert, nicht mit einem Vertrieb. Wir hören zu, erfassen Ihre Ziele und stecken den Rahmen ab. Kein Verkaufsdruck, nur echtes Interesse an Ihrer Marke.",
    color: "#E39832",
    details: [
      { icon: Clock, text: "30 min. Gespräch" },
      { icon: Target, text: "Ziele definieren" },
      { icon: Heart, text: "100% kostenlos" },
    ],
    checks: ["Kostenlos & unverbindlich", "Ziele & Wünsche besprechen", "Transparentes Angebot erhalten"],
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Konzept & Strategie",
    subtitle: "Analyse",
    description: "Wir analysieren Markt, Zielgruppe und Wettbewerb. Daraus entsteht eine klare Positionierung. Die Strategie, die jeder gestalterischen Entscheidung zugrunde liegt, egal ob digital, gedruckt oder am Fahrzeug.",
    color: "#E39832",
    details: [
      { icon: Target, text: "Marktanalyse" },
      { icon: Lightbulb, text: "Zielgruppenforschung" },
      { icon: Zap, text: "Strategieentwicklung" },
    ],
    checks: ["Markt & Wettbewerbsanalyse", "Zielgruppendefinition", "Strategische Positionierung"],
  },
  {
    number: "03",
    icon: Pen,
    title: "Design & Umsetzung",
    subtitle: "Kreation",
    description: "Aus Strategie wird Gestaltung. Wir entwerfen, gestalten und schärfen jedes Detail, immer in enger Abstimmung. Vom Logo über die Website bis zum druckfertigen Layout. Regelmäßige Stände, Feedback jederzeit möglich.",
    color: "#E39832",
    flow: ["Entwurf", "Feedback", "Revision", "Finalisierung"],
    checks: ["Iterative Designrunden", "Regelmäßige Updates", "Feedback jederzeit möglich"],
  },
  {
    number: "04",
    icon: Truck,
    title: "Produktion & Übergabe",
    subtitle: "In die Realität",
    description: "Hier wird die Marke greifbar. Wir bringen das Design auf das Material: gedruckte Geschäftsausstattung und Broschüren, beklebte Fahrzeuge, bedruckte Textilien, Schilder und Werbetechnik. Robert begleitet die Produktion persönlich und prüft jedes Stück, bevor es zu Ihnen geht. Auf Wunsch übernehmen wir auch Montage und Folierung vor Ort. Und danach bleiben wir Ihr fester Partner für alles, was nachkommt.",
    color: "#E39832",
    flow: ["Druck & Produktion", "Veredelung", "Montage & Folierung", "Übergabe"],
    checks: ["Print, Textil & Werbetechnik aus einer Hand", "Fahrzeugfolierung & Montage vor Ort", "Persönliche Qualitätskontrolle durch Robert", "Fester Ansprechpartner statt Ticket-System"],
  },
]

function StepContent({ step, isActive }: { step: typeof steps[0]; isActive: boolean }) {
  const Icon = step.icon

  return (
    <div>
      {/* Big number background */}
      <div className="absolute top-6 right-8 text-[8rem] md:text-[12rem] font-bold text-white/[0.02] leading-none select-none pointer-events-none">
        {step.number}
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <motion.div
            animate={isActive ? { rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-14 h-14 rounded-2xl bg-[#E39832]/10 border border-[#E39832]/20 flex items-center justify-center shrink-0"
          >
            <Icon className="w-7 h-7 text-[#E39832]" />
          </motion.div>
          <div>
            <span className="text-[#E39832] text-[10px] font-semibold tracking-[0.2em] uppercase block mb-1">{step.subtitle}</span>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{step.title}</h3>
          </div>
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={isActive ? { width: 60 } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-[2px] bg-gradient-to-r from-[#E39832] to-transparent mb-6 mt-4"
        />

        <p className="text-white/50 text-[15px] leading-relaxed mb-8 max-w-lg">
          {step.description}
        </p>

        {/* Step-specific visuals */}
        {step.details && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {step.details.map((d, di) => {
              const DIcon = d.icon
              return (
                <motion.div
                  key={d.text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.4, delay: 0.4 + di * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#E39832]/15 transition-colors duration-300"
                >
                  <DIcon className="w-4 h-4 text-[#E39832] shrink-0" />
                  <span className="text-white/60 text-sm">{d.text}</span>
                </motion.div>
              )
            })}
          </div>
        )}

        {step.flow && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {step.flow.map((s, i) => (
              <motion.div
                key={s}
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
              >
                <span className="text-xs px-4 py-2 rounded-full bg-[#E39832]/10 text-[#E39832] border border-[#E39832]/20 font-medium">
                  {s}
                </span>
                {i < step.flow!.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/15" />
                )}
              </motion.div>
            ))}
          </div>
        )}


        {/* Checks */}
        <div className="space-y-3">
          {step.checks.map((item, ci) => (
            <motion.div
              key={item}
              className="flex items-center gap-3 text-white/45 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.3, delay: 0.6 + ci * 0.08 }}
            >
              <CheckCircle2 className="w-4 h-4 text-[#E39832] shrink-0" />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Process() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Each step triggers at its dot position (0%, 33%, 66%, 100% of the timeline)
  // Line stops at each dot, then continues to the next
  const stepBreakpoints = steps.map((_, i) => 0.08 + (i / (steps.length - 1)) * 0.84)
  const lineStops = steps.map((_, i) => (i / (steps.length - 1)) * 100)

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let step = 0
    for (let i = stepBreakpoints.length - 1; i >= 0; i--) {
      if (v >= stepBreakpoints[i]) {
        step = i
        break
      }
    }
    setActiveStep(step)
  })

  const lineProgress = useTransform(scrollYProgress, stepBreakpoints, lineStops)

  return (
    <section id="prozess">
      <div ref={containerRef} className="relative" style={{ height: isMobile ? `${steps.length * 80}vh` : `${steps.length * 100 + 50}vh` }}>
        {/* Sticky viewport */}
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            animate={{
              x: activeStep % 2 === 0 ? "-10%" : "60%",
              y: activeStep % 2 === 0 ? "10%" : "-10%",
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              background: "radial-gradient(circle, rgba(227,152,50,0.04) 0%, transparent 70%)",
            }}
          />

          <div className="h-full flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              {/* Header */}
              <div className="text-center mb-6 md:mb-14">
                <span className="text-[#E39832] text-sm font-medium tracking-widest uppercase mb-3 block">
                  Prozess
                </span>
                <h2
                  className="text-3xl md:text-5xl font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <span className="text-white">Von der Vision</span>{" "}
                  <span className="text-white/30">zur Marke.</span>
                </h2>
              </div>

              {/* Layout: Timeline + Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-12">
                {/* Left: Vertical Timeline (Desktop) */}
                <div className="hidden lg:block relative">
                  <div className="relative h-[360px]">
                    {/* Track background */}
                    <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-white/[0.04] rounded-full" />
                    {/* Glowing active line */}
                    <ProgressLine progress={lineProgress} />

                    {/* Step dots + labels */}
                    {steps.map((step, i) => {
                      const Icon = step.icon
                      const isCurrent = i === activeStep
                      const isPast = i < activeStep
                      const y = (i / (steps.length - 1)) * 100

                      return (
                        <div
                          key={step.number}
                          className="absolute flex items-center"
                          style={{ top: `${y}%`, left: 0, transform: "translateY(-50%)" }}
                        >
                          {/* Outer ring + dot */}
                          <div className="relative flex items-center justify-center" style={{ width: 26, height: 26 }}>
                            {/* Pulse ring for current */}
                            {isCurrent && (
                              <motion.div
                                className="absolute inset-0 rounded-full border-2 border-[#E39832]/40"
                                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                              />
                            )}
                            {/* Dot */}
                            <motion.div
                              animate={{
                                width: isCurrent ? 26 : isPast ? 14 : 10,
                                height: isCurrent ? 26 : isPast ? 14 : 10,
                                backgroundColor: isCurrent || isPast ? "#E39832" : "transparent",
                                borderColor: isCurrent ? "#E39832" : isPast ? "#E39832" : "rgba(255,255,255,0.12)",
                                boxShadow: isCurrent
                                  ? "0 0 20px rgba(227,152,50,0.5), 0 0 40px rgba(227,152,50,0.2)"
                                  : isPast
                                  ? "0 0 8px rgba(227,152,50,0.2)"
                                  : "none",
                              }}
                              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                              className="rounded-full border-2 z-10 relative flex items-center justify-center"
                            >
                              {isCurrent && (
                                <Icon className="w-3 h-3 text-white" />
                              )}
                            </motion.div>
                          </div>

                          {/* Label */}
                          <motion.div
                            animate={{
                              opacity: isCurrent ? 1 : isPast ? 0.5 : 0.15,
                              x: isCurrent ? 14 : 10,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="ml-1 whitespace-nowrap"
                          >
                            <div className={cn(
                              "text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-500",
                              isCurrent ? "text-[#E39832]" : isPast ? "text-[#E39832]/40" : "text-white/15"
                            )}>
                              Step {step.number}
                            </div>
                            <div className={cn(
                              "text-sm font-medium transition-colors duration-500",
                              isCurrent ? "text-white" : isPast ? "text-white/40" : "text-white/10"
                            )}>
                              {step.title}
                            </div>
                          </motion.div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile step indicator */}
                <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          width: i === activeStep ? 32 : 8,
                          backgroundColor: i <= activeStep ? "#E39832" : "rgba(255,255,255,0.1)",
                        }}
                        transition={{ duration: 0.4 }}
                        className="h-1.5 rounded-full"
                      />
                    </div>
                  ))}
                  <span className="text-white/30 text-xs ml-3 font-medium">
                    {activeStep + 1}/{steps.length}
                  </span>
                </div>

                {/* Right: Content area */}
                <div className="relative min-h-[350px] md:min-h-[440px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 50, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -40, filter: "blur(4px)" }}
                      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                      className="relative p-6 md:p-10 rounded-3xl bg-white/[0.015] border border-white/[0.06] backdrop-blur-sm overflow-hidden"
                    >
                      <StepContent step={steps[activeStep]} isActive={true} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgressLine({ progress }: { progress: MotionValue<number> }) {
  const heightPx = useTransform(progress, (v) => `${v}%`)
  return (
    <>
      {/* Main line */}
      <motion.div
        className="absolute left-3 top-0 w-[2px] rounded-full origin-top"
        style={{
          height: heightPx,
          background: "linear-gradient(to bottom, #E39832 0%, #E39832 80%, rgba(227,152,50,0.3) 100%)",
        }}
      />
      {/* Glow overlay */}
      <motion.div
        className="absolute left-[10px] top-0 w-[6px] rounded-full origin-top blur-[3px]"
        style={{
          height: heightPx,
          background: "linear-gradient(to bottom, rgba(227,152,50,0.4) 0%, rgba(227,152,50,0.1) 100%)",
        }}
      />
    </>
  )
}
