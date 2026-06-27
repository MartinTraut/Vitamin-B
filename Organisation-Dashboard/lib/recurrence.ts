// Wiederholungs-Engine für Termine. Reine Funktionen, leicht testbar.
// Modell: Anker-Datum + Frequenz/Intervall + completedDates[].

import type { Appointment } from "./types"

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseISO(iso: string): Date {
  return new Date(iso + "T00:00:00")
}

export function todayISO(): string {
  return toISO(new Date())
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function diffDays(a: string, b: string): number {
  const ms = parseISO(a).getTime() - parseISO(b).getTime()
  return Math.round(ms / 86400000)
}

// Letzter Tag des Monats (Monat 0-basiert).
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// k-tes Vorkommen ab dem Anker. Index-basiert (statt iterativem setMonth),
// damit Monatsenden nicht driften: ein 31. wird in kurzen Monaten auf den
// Monatsletzten geklemmt und bleibt im nächsten langen Monat wieder der 31.
function nthOccurrence(appt: Appointment, k: number): string {
  const anchor = parseISO(appt.date)
  const n = Math.max(1, appt.recurrence.interval)
  switch (appt.recurrence.freq) {
    case "weekly": {
      const d = new Date(anchor)
      d.setDate(d.getDate() + 7 * n * k)
      return toISO(d)
    }
    case "monthly": {
      const year = anchor.getFullYear()
      const month = anchor.getMonth() + n * k
      const target = new Date(year, month, 1)
      target.setDate(Math.min(anchor.getDate(), daysInMonth(target.getFullYear(), target.getMonth())))
      return toISO(target)
    }
    case "yearly": {
      const year = anchor.getFullYear() + n * k
      const month = anchor.getMonth()
      const target = new Date(year, month, 1)
      // Schaltjahr-Anker (29.02.) fällt in Nicht-Schaltjahren auf den 28.02.
      target.setDate(Math.min(anchor.getDate(), daysInMonth(year, month)))
      return toISO(target)
    }
    default:
      return appt.date
  }
}

// Alle Vorkommen eines Termins in einem Datumsbereich [from, to].
export function occurrencesInRange(
  appt: Appointment,
  from: string,
  to: string,
): string[] {
  const result: string[] = []
  if (appt.recurrence.freq === "none") {
    if (appt.date >= from && appt.date <= to) result.push(appt.date)
    return result
  }
  let k = 0
  let cur = nthOccurrence(appt, 0)
  // Bis zum Bereichsanfang vorspulen.
  while (cur < from && k < 5000) {
    k++
    cur = nthOccurrence(appt, k)
  }
  while (cur <= to && k < 5000) {
    result.push(cur)
    k++
    cur = nthOccurrence(appt, k)
  }
  return result
}

export interface DueInfo {
  date: string
  overdue: boolean
  inDays: number
}

// Nächstes nicht-erledigtes Vorkommen ab heute (für Agenda-Sortierung).
export function currentDue(appt: Appointment, today = todayISO()): DueInfo | null {
  const horizon = addDaysISO(today, 365)
  const occ = occurrencesInRange(appt, addDaysISO(today, -365), horizon)
  const next = occ.find(
    (o) => o >= today && !appt.completedDates.includes(o),
  )
  const target = next ?? occ.find((o) => !appt.completedDates.includes(o))
  if (!target) return null
  return {
    date: target,
    overdue: target < today,
    inDays: diffDays(target, today),
  }
}
