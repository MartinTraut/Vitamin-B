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
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#E39832] transition-colors mb-12 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </a>

        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Datenschutzerklärung
        </h1>
        <p className="text-white/40 text-sm mb-12">Stand: Mai 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60">
          <p>
            Mir ist wichtig, dass Sie wissen, was beim Besuch dieser Seite mit Ihren
            Daten passiert. Die kurze Antwort: so wenig wie möglich. Hier steht im
            Detail, was, warum und auf welcher Grundlage.
          </p>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              1. Verantwortlicher
            </h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="mt-2">
              Robert Bauer
              <br />
              vitaminb kommunikation & design
              <br />
              Hermann-Lang-Straße 32
              <br />
              74196 Neuenstadt am Kocher
              <br />
              Telefon:{" "}
              <a
                href="tel:+4915158779133"
                className="text-[#E39832] hover:text-[#E39832] underline underline-offset-2 decoration-[#E39832]/30 transition-colors"
              >
                0151 58779133
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
              2. Worum es hier geht
            </h2>
            <p>
              Diese Website ist eine reine Informationsseite. Es gibt kein
              Kontaktformular, keinen Login und keinen Online-Shop. Sie können sich
              informieren und mich anschließend telefonisch oder per E-Mail erreichen.
              Eine aktive Eingabe von Daten auf der Seite selbst findet nicht statt.
              Eine automatisierte Entscheidungsfindung oder ein Profiling findet
              ebenfalls nicht statt.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              3. Hosting und Server-Logfiles
            </h2>
            <p className="mb-3">
              Die Website wird bei einem externen Dienstleister gehostet. Beim Aufruf
              erfasst der Server technisch notwendige Daten in sogenannten
              Server-Logfiles. Das sind: IP-Adresse, Datum und Uhrzeit des Zugriffs,
              aufgerufene Seite, übertragene Datenmenge, die zuvor besuchte Seite sowie
              Browser und Betriebssystem.
            </p>
            <p className="mb-3">
              Diese Daten sind nötig, damit die Seite überhaupt ausgeliefert werden
              kann und stabil und sicher läuft. Rechtsgrundlage ist Art. 6 Abs. 1 lit.
              f DSGVO. Mein berechtigtes Interesse liegt in einem zuverlässigen und
              sicheren Betrieb der Website. Eine Zusammenführung dieser Daten mit Ihrer
              Person nehme ich nicht vor.
            </p>
            <p className="mb-3">Anbieter und Auftragsverarbeiter ist:</p>
            <p className="mb-3">
              STRATO AG
              <br />
              Otto-Ostrowski-Straße 7
              <br />
              10249 Berlin
              <br />
              Deutschland
            </p>
            <p>
              Mit STRATO besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28
              DSGVO. Die Verarbeitung der Logfiles findet auf Servern in Deutschland
              statt. Eine Übermittlung von Daten in Länder außerhalb der Europäischen
              Union findet nicht statt. Server-Logfiles werden in der Regel nach kurzer
              Zeit automatisch gelöscht, soweit sie nicht aus Sicherheitsgründen
              ausnahmsweise länger benötigt werden.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              4. Cookies, Tracking und Analyse
            </h2>
            <p>
              Diese Website setzt keine Cookies, die nicht technisch notwendig sind. Es
              kommen keine Analyse-Werkzeuge wie Google Analytics, keine Tracking-Pixel
              und keine Werbenetzwerke zum Einsatz. Ihr Verhalten auf der Seite wird
              nicht ausgewertet.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              5. Schriftarten
            </h2>
            <p>
              Die verwendeten Schriftarten werden lokal vom Server dieser Website
              geladen und beim Seitenaufbau erzeugt. Es wird dabei keine Verbindung zu
              Servern von Google oder anderen Anbietern aufgebaut und keine Ihrer Daten
              dorthin übertragen.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              6. Kontaktaufnahme
            </h2>
            <p className="mb-3">
              Wenn Sie mich per E-Mail oder Telefon kontaktieren, verarbeite ich Ihre
              Angaben ausschließlich, um Ihre Anfrage zu beantworten und das Anliegen
              zu bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn es um
              die Anbahnung oder Erfüllung eines Auftrags geht, ansonsten Art. 6 Abs. 1
              lit. f DSGVO aufgrund meines Interesses, Anfragen sinnvoll zu
              beantworten.
            </p>
            <p>
              Ihre Anfrage und die zugehörigen Daten bewahre ich so lange auf, wie es
              zur Bearbeitung nötig ist. Danach lösche ich sie, sofern keine
              gesetzlichen Aufbewahrungsfristen entgegenstehen.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              7. Verweise auf Karten und externe Seiten
            </h2>
            <p>
              Die Adresse verlinkt auf einen externen Kartendienst. Es handelt sich um
              einen einfachen Link, nicht um eine eingebettete Karte. Erst wenn Sie den
              Link anklicken und die fremde Seite öffnen, gelten die
              Datenschutzbestimmungen des jeweiligen Anbieters. Auf deren Inhalt und
              Datenverarbeitung habe ich keinen Einfluss.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              8. Ihre Rechte
            </h2>
            <p className="mb-3">Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Für die Ausübung Ihrer Rechte genügt eine formlose Nachricht an die oben
              genannten Kontaktdaten.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              9. Beschwerderecht
            </h2>
            <p className="mb-3">
              Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen
              geltendes Recht verstößt, können Sie sich bei einer Aufsichtsbehörde
              beschweren. Zuständig ist:
            </p>
            <p>
              Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
              Baden-Württemberg
              <br />
              Lautenschlagerstraße 20
              <br />
              70173 Stuttgart
              <br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              10. Verschlüsselung
            </h2>
            <p>
              Diese Seite wird über eine verschlüsselte Verbindung ausgeliefert
              (SSL/TLS). Sie erkennen das am Schloss-Symbol in der Adresszeile Ihres
              Browsers. So sind die Daten, die Sie an diese Website übermitteln, auf
              dem Transportweg geschützt.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold mb-4">
              11. Stand und Änderungen
            </h2>
            <p>
              Ich passe diese Erklärung an, sobald sich an der Website oder der
              Rechtslage etwas ändert. Es gilt jeweils die hier veröffentlichte
              Fassung.
            </p>
            <p className="mt-3">Stand: Mai 2026</p>
          </section>
        </div>
      </div>
    </main>
  )
}
