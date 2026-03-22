import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
}

export default function Datenschutz() {
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
          Datenschutzerklärung
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60">
          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              1. Datenschutz auf einen Blick
            </h2>
            <h3 className="text-white/80 font-medium mb-2">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit
              Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
              Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
              identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              2. Verantwortliche Stelle
            </h2>
            <p>
              Robert Bauer
              <br />
              vitamin b - kommunikation & design
              <br />
              Hermann-Lang-Str. 32
              <br />
              74196 Neuenstadt am Kocher
              <br />
              E-Mail: mail@vitaminb-design.de
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              3. Datenerfassung auf dieser Website
            </h2>
            <h3 className="text-white/80 font-medium mb-2">Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen
              in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns
              übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes
              Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners,
              Uhrzeit der Serveranfrage und IP-Adresse.
            </p>
            <h3 className="text-white/80 font-medium mb-2 mt-4">Kontaktformular</h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre
              Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen
              Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
              Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne
              Ihre Einwilligung weiter.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              4. Ihre Rechte
            </h2>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre
              gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und
              den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder
              Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema
              personenbezogene Daten können Sie sich jederzeit an uns wenden.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              5. Cookies
            </h2>
            <p>
              Diese Website verwendet keine Tracking-Cookies. Es werden lediglich
              technisch notwendige Cookies verwendet, die für den Betrieb der Website
              erforderlich sind.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
