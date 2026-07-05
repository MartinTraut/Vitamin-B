// Verlaufs-Reihen für Finanz-Charts: Buchungen nach Tag / Woche / Monat bucketen.
// Wird sowohl von der Firmen- als auch der Privat-Ansicht genutzt.

import type { Transaction, Debt } from "./types"
import { monthName } from "./format"
import { toISO, parseISO } from "./recurrence"

export type Gran = "day" | "week" | "month"
export const GRAN_LABEL: Record<Gran, string> = { day: "Tag", week: "Woche", month: "Monat" }

function startOfWeek(d: Date): Date {
  const x = new Date(d)
  const off = (x.getDay() + 6) % 7 // Montag = 0
  x.setDate(x.getDate() - off)
  x.setHours(0, 0, 0, 0)
  return x
}

export interface SeriesPoint {
  month: string
  income: number
  expense: number
  profit: number // Einnahmen − Ausgaben je Bucket (Gewinn bzw. privat: Saldo)
  debt?: number // negativ = offene Restschuld zum Bucket-Ende (nur wenn debts übergeben)
}

// Leere Perioden bleiben als Null-Bucket erhalten, damit die Achse durchläuft.
// Werden `debts` übergeben, bekommt jeder Bucket zusätzlich die (negative) Restschuld
// zum jeweiligen Periodenende — fürs Einzeichnen unter der 0-Linie.
export function buildSeries(tx: Transaction[], gran: Gran, debts?: Debt[]): SeriesPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets: SeriesPoint[] = []
  const ends: string[] = [] // ISO-Periodenende je Bucket
  const idx = new Map<string, number>()
  const push = (key: string, label: string, end: Date) => {
    idx.set(key, buckets.length)
    buckets.push({ month: label, income: 0, expense: 0, profit: 0 })
    ends.push(toISO(end))
  }

  if (gran === "month") {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
      push(`${d.getFullYear()}-${d.getMonth()}`, monthName(d.getMonth()), end)
    }
  } else if (gran === "week") {
    const w = startOfWeek(today)
    for (let i = 7; i >= 0; i--) {
      const d = new Date(w)
      d.setDate(w.getDate() - i * 7)
      const end = new Date(d)
      end.setDate(d.getDate() + 6)
      push(toISO(d), `${d.getDate()}.${d.getMonth() + 1}.`, end)
    }
  } else {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      push(toISO(d), `${d.getDate()}.${d.getMonth() + 1}.`, d)
    }
  }

  for (const t of tx) {
    const d = parseISO(t.date)
    const key =
      gran === "month"
        ? `${d.getFullYear()}-${d.getMonth()}`
        : gran === "week"
          ? toISO(startOfWeek(d))
          : t.date
    const i = idx.get(key)
    if (i == null) continue
    if (t.type === "income") buckets[i].income += t.amount
    else buckets[i].expense += t.amount
  }
  for (const b of buckets) b.profit = b.income - b.expense

  if (debts && debts.length) {
    for (let i = 0; i < buckets.length; i++) {
      const endISO = ends[i]
      let remaining = 0
      for (const dbt of debts) {
        const undoneAfter = (dbt.payments ?? [])
          .filter((p) => p.date > endISO)
          .reduce((s, p) => s + p.amount, 0)
        remaining += Math.max(0, dbt.total - dbt.paid + undoneAfter)
      }
      buckets[i].debt = -Math.round(remaining)
    }
  }
  return buckets
}
