import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Marquee } from "@/components/marquee"
import { Services } from "@/components/services"
import { Portfolio } from "@/components/portfolio"
import { About } from "@/components/about"
import { Stats } from "@/components/stats"
import { Process } from "@/components/process"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Marquee />
      <Services />
      <Portfolio />
      <About />
      <Stats />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
