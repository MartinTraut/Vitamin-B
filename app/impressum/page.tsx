import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
}

export default function Impressum() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-32">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#ff6a00] transition-colors mb-12 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </a>

        <h1
          className="text-4xl font-bold mb-12"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Impressum
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60">
          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              Robert Bauer
              <br />
              vitamin b - kommunikation & design
              <br />
              Hermann-Lang-Str. 32
              <br />
              74196 Neuenstadt am Kocher
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">Kontakt</h2>
            <p>
              Telefon: +49 151 72896574
              <br />
              E-Mail: mail@vitaminb-design.de
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Umsatzsteuer-ID
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a
              Umsatzsteuergesetz: wird nachgereicht.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p>
              Robert Bauer
              <br />
              Hermann-Lang-Str. 32
              <br />
              74196 Neuenstadt am Kocher
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              Haftungsausschluss
            </h2>
            <h3 className="text-white/80 font-medium mb-2">Haftung für Inhalte</h3>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
              die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
              jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7
              Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
              Gesetzen verantwortlich.
            </p>
            <h3 className="text-white/80 font-medium mb-2 mt-4">
              Haftung für Links
            </h3>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren
              Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
              Inhalte auch keine Gewähr übernehmen.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
              Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
              jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
