// Formatierungs-Helfer (DE-Locale).

export function eur(value: number): string {
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

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex]
}
