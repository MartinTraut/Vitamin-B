// Automatische Rechnungs-Regeln (überfällig, wiederkehrend) — als eigenes Modul,
// damit sowohl der lokale Store (store.tsx) als auch der Supabase-Sync (sync.ts)
// dieselbe Logik auf eingehende Daten anwenden können, ohne Zirkular-Import.

import { nanoid } from "nanoid"
import type { Database, Invoice } from "./types"
import { nextNumber } from "./totals"
import { todayISO, addDaysISO, nthOccurrenceOf } from "./recurrence"

// Gesendete Rechnungen, deren Zahlungsziel überschritten ist, automatisch
// auf "überfällig" heben — damit niemand offene Forderungen übersieht.
export function withOverdue(db: Database): Database {
  const today = todayISO()
  return {
    ...db,
    invoices: db.invoices.map((i) =>
      i.status === "gesendet" && i.dueDate < today ? { ...i, status: "ueberfaellig" as const } : i,
    ),
  }
}

// Wiederkehrende Rechnungen: für jede "Vorlagen"-Rechnung mit fälliger
// nextRecurrenceDate werden ALLE seit dem letzten Lauf fälligen Folgerechnungen
// als Entwürfe nachgeholt (Catch-up), nicht nur eine — sonst fehlen nach längerer
// Pause ganze Zyklen. Das Original bleibt als Vorlage bestehen, die nächste
// Fälligkeit rückt hinter heute.
export function withRecurringInvoices(db: Database): Database {
  const today = todayISO()
  const due = db.invoices.filter(
    (i) => i.recurrence && i.recurrence.freq !== "none" && !i.recurrenceParentId && i.nextRecurrenceDate && i.nextRecurrenceDate <= today,
  )
  if (due.length === 0) return db
  const generated: Invoice[] = []
  const updatedOriginals = new Map<string, string>() // id -> neue nextRecurrenceDate
  for (const original of due) {
    let issue = original.nextRecurrenceDate!
    // Schutz gegen Endlosschleife, falls die Recurrence nicht vorwärts rückt.
    let guard = 0
    while (issue <= today && guard++ < 120) {
      // Nummer im Jahr des Ausstellungsdatums vergeben — Catch-up-Rechnungen aus
      // dem Vorjahr dürfen keine Nummern des laufenden Jahres verbrauchen (§14).
      const issueYear = Number(issue.slice(0, 4))
      const number = nextNumber([...db.invoices.map((i) => i.number), ...generated.map((g) => g.number)], issueYear)
      generated.push({
        ...original,
        id: nanoid(8),
        number,
        status: "entwurf",
        issueDate: issue,
        serviceDate: issue,
        dueDate: addDaysISO(issue, db.company.paymentTermDays),
        createdAt: new Date().toISOString(),
        items: original.items.map((it) => ({ ...it, id: nanoid(6) })),
        recurrence: undefined,
        recurrenceParentId: original.id,
        nextRecurrenceDate: undefined,
        // Beleg-Historie der Vorlage darf NICHT auf die Folgerechnung vererbt
        // werden: weder Angebots-Verknüpfung noch Mahn-/Storno-Zustand.
        quoteId: undefined,
        dunningLevel: undefined,
        dunningDates: undefined,
        voided: undefined,
        creditNoteFor: undefined,
      })
      const next = nthOccurrenceOf(issue, original.recurrence!, 1)
      if (next <= issue) break
      issue = next
    }
    updatedOriginals.set(original.id, issue)
  }
  return {
    ...db,
    invoices: [
      ...generated,
      ...db.invoices.map((i) => (updatedOriginals.has(i.id) ? { ...i, nextRecurrenceDate: updatedOriginals.get(i.id) } : i)),
    ],
  }
}
