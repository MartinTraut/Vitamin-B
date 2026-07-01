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

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

export function dateDE(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

// Vollständiges Datum mit Jahr — für rechtsverbindliche Belege (Rechnung/Angebot).
export function dateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex]
}
