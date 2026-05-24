import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
}

export default function Impressum() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-5 md:px-6 py-20 md:py-32">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#E39832] transition-colors mb-8 md:mb-12 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </a>

        <h1
          className="text-3xl md:text-4xl font-bold mb-8 md:mb-12"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Impressum
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60">
          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Angaben gemäß § 5 DDG
            </h2>
            <p>
              vitaminb kommunikation &amp; design
              <br />
              Inhaber: Robert Bauer
              <br />
              Hermann-Lang-Straße 32
              <br />
              74196 Neuenstadt am Kocher
              <br />
              Deutschland
            </p>
            <p className="mt-3">
              Einzelunternehmen, nicht im Handelsregister eingetragen.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">Kontakt</h2>
            <p>
              Telefon:{" "}
              <a
                href="tel:+4915172896574"
                className="text-[#E39832] hover:text-[#E39832] underline underline-offset-2 decoration-[#E39832]/30 transition-colors"
              >
                +49 151 72896574
              </a>
              <br />
              E-Mail:{" "}
              <a
                href="mailto:mail@vitaminb-design.de"
                className="text-[#E39832] hover:text-[#E39832] underline underline-offset-2 decoration-[#E39832]/30 transition-colors"
              >
                mail@vitaminb-design.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
              <br />
              DE269883628
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Verantwortlich für den Inhalt
            </h2>
            <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
            <p className="mt-2">
              Robert Bauer
              <br />
              Hermann-Lang-Straße 32
              <br />
              74196 Neuenstadt am Kocher
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Verbraucherstreitbeilegung
            </h2>
            <p>
              Ich bin nicht verpflichtet und nicht bereit, an einem
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Haftung für Inhalte
            </h2>
            <p>
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die
              Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehme ich
              jedoch keine Gewähr.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Haftung für Links
            </h2>
            <p>
              Diese Website enthält Verweise auf externe Websites Dritter. Auf deren
              Inhalte habe ich keinen Einfluss. Deshalb übernehme ich für diese fremden
              Inhalte keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets der
              jeweilige Anbieter verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser
              Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als
              solche gekennzeichnet. Vervielfältigung, Bearbeitung und Verbreitung
              außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen
              Zustimmung.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
