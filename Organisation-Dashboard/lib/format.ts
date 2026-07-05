// Formatierungs-Helfer (DE-Locale).

// Exakter Geldbetrag mit Cent — für Belege & Buchhaltung (Rechnungen, Angebote, Ledger).
export function eur(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Gerundeter Betrag ohne Cent — für glanceable KPI-Kacheln & Schätzungen (Dashboard, Pipeline).
export function eur0(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function num(value: number): string {
  return new Intl.NumberFormat("de-DE").format(value)
}

// Zentrale DE-Betrags-Heuristik für Formulareingaben (Gegenstück zu eur/deNum).
// Beispiele:
//   "1.000"     → 1000    (Punkt als Tausendertrenner, NICHT 1)
//   "1.000,50"  → 1000.5
//   "12,5"      → 12.5
//   "1234.56"   → 1234.56 (englische Eingabe bleibt gültig)
//   "1.5"       → 1.5     (kein 3er-Raster → Dezimalpunkt)
//   "€ 89"      → 89
// Liefert NaN, wenn die Eingabe kein endlicher Betrag ist.
export function parseAmountDE(s: string): number {
  const raw = s.replace(/[\s€]/g, "")
  if (raw === "") return NaN
  let normalized: string
  if (raw.includes(",")) {
    // Komma vorhanden → deutsches Format: Punkte sind Tausendertrenner.
    normalized = raw.replace(/\./g, "").replace(",", ".")
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) {
    // Nur Punkte im exakten 3er-Raster → Tausendertrenner entfernen.
    normalized = raw.replace(/\./g, "")
  } else {
    normalized = raw
  }
  const n = Number(normalized)
  return Number.isFinite(n) ? n : NaN
}

// Erfasste Minuten als lesbare Dauer — für Zeiterfassung (Tasks, Projekte).
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} Min.`
  if (m === 0) return `${h} Std.`
  return `${h} Std. ${m} Min.`
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

export function dateDE(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

// Kompaktes numerisches Datum mit Jahr — Buchhaltungs-Standard für Tabellen/Ledger.
export function dateShort(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

// Vollständiges Datum mit Jahr — für rechtsverbindliche Belege (Rechnung/Angebot).
export function dateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex]
}
