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

// Datum um ein Wiederholungs-Intervall weiterschalten.
function step(iso: string, appt: Appointment): string {
  const d = parseISO(iso)
  const n = Math.max(1, appt.recurrence.interval)
  switch (appt.recurrence.freq) {
    case "weekly":
      d.setDate(d.getDate() + 7 * n)
      break
    case "monthly":
      d.setMonth(d.getMonth() + n)
      break
    case "yearly":
      d.setFullYear(d.getFullYear() + n)
      break
    default:
      return iso
  }
  return toISO(d)
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
  let cur = appt.date
  let guard = 0
  // Bis zum Bereichsanfang vorspulen.
  while (cur < from && guard < 5000) {
    cur = step(cur, appt)
    guard++
  }
  while (cur <= to && guard < 5000) {
    result.push(cur)
    cur = step(cur, appt)
    guard++
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
