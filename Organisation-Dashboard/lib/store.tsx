"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { nanoid } from "nanoid"
import type {
  Appointment,
  AppointmentCategoryDef,
  CompanySettings,
  Customer,
  Database,
  Deal,
  DealStage,
  Invoice,
  Note,
  Person,
  Project,
  Quote,
  Task,
  TaskStatus,
  Template,
  TimeEntry,
  Transaction,
  Debt,
  Whiteboard,
} from "./types"
import { buildDemoData } from "./demo-data"
import { nextNumber, computeTotals } from "./totals"
import { todayISO, addDaysISO, nthOccurrenceOf } from "./recurrence"
import { useSupabaseSync } from "./sync"

const DB_KEY = "vitaminb-os-db-v2"
const PERSON_KEY = "vitaminb-active-person"

// Gesendete Rechnungen, deren Zahlungsziel überschritten ist, automatisch
// auf "überfällig" heben — damit niemand offene Forderungen übersieht.
function withOverdue(db: Database): Database {
  const today = todayISO()
  return {
    ...db,
    invoices: db.invoices.map((i) =>
      i.status === "gesendet" && i.dueDate < today ? { ...i, status: "ueberfaellig" as const } : i,
    ),
  }
}

// Verknüpfung Pipeline → Angebote: sobald ein Deal auf der Stufe "angebot"
// steht und noch kein Angebot mit ihm verknüpft ist, automatisch ein
// Entwurf-Angebot anlegen. So taucht jedes Angebot direkt in der Angebote-
// Sektion auf, ohne manuellen Schritt. Greift bei Move, Drag und Neuanlage.
function withAutoQuotes(prev: Database, deals: Deal[]): Database {
  const need = deals.filter(
    (d) => d.stage === "angebot" && !prev.quotes.some((q) => q.dealId === d.id),
  )
  if (need.length === 0) return { ...prev, deals }
  const year = new Date().getFullYear()
  const created: Quote[] = []
  for (const d of need) {
    const number = nextNumber(
      [...prev.quotes.map((q) => q.number), ...created.map((c) => c.number)],
      year,
    )
    created.push({
      id: nanoid(8),
      number,
      customerId: d.customerId,
      status: "entwurf",
      items: [],
      validUntil: addDaysISO(todayISO(), prev.company.paymentTermDays),
      person: d.person,
      dealId: d.id,
      createdAt: new Date().toISOString(),
    })
  }
  return { ...prev, deals, quotes: [...created, ...prev.quotes] }
}

// Wiederkehrende Rechnungen: für jede "Vorlagen"-Rechnung mit fälliger
// nextRecurrenceDate wird ein neuer Entwurf generiert (Original bleibt als
// Vorlage bestehen, die nächste Fälligkeit rückt einen Zyklus weiter).
function withRecurringInvoices(db: Database): Database {
  const today = todayISO()
  const due = db.invoices.filter(
    (i) => i.recurrence && i.recurrence.freq !== "none" && !i.recurrenceParentId && i.nextRecurrenceDate && i.nextRecurrenceDate <= today,
  )
  if (due.length === 0) return db
  const year = new Date().getFullYear()
  const generated: Invoice[] = []
  const updatedOriginals = new Map<string, string>() // id -> neue nextRecurrenceDate
  for (const original of due) {
    const issue = original.nextRecurrenceDate!
    const number = nextNumber([...db.invoices.map((i) => i.number), ...generated.map((g) => g.number)], year)
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
      dunningLevel: undefined,
      dunningDates: undefined,
      voided: undefined,
      creditNoteFor: undefined,
    })
    updatedOriginals.set(original.id, nthOccurrenceOf(issue, original.recurrence!, 1))
  }
  return {
    ...db,
    invoices: [
      ...generated,
      ...db.invoices.map((i) => (updatedOriginals.has(i.id) ? { ...i, nextRecurrenceDate: updatedOriginals.get(i.id) } : i)),
    ],
  }
}

// Gespeicherte Daten über die Demo-Defaults mergen, damit neue (auch
// verschachtelte) Felder bei altem Cache vorhanden sind und nichts undefined wird.
function mergeDb(partial: Partial<Database>): Database {
  const base = buildDemoData()
  return withRecurringInvoices(withOverdue({
    ...base,
    ...partial,
    // Neues Feld: bei Bestandsdaten leer starten statt Demo-Daten einzuspielen.
    debts: partial.debts ?? [],
    notes: partial.notes ?? [],
    timeEntries: partial.timeEntries ?? [],
    company: { ...base.company, ...(partial.company ?? {}) },
  }))
}

interface StoreValue {
  db: Database
  activePerson: Person
  setActivePerson: (p: Person) => void
  addTask: (input: Omit<Task, "id" | "createdAt">) => void
  toggleTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => void
  reorderTasks: (next: Task[]) => void
  removeTask: (id: string) => void
  addAppointment: (input: Omit<Appointment, "id" | "createdAt">) => void
  updateAppointment: (id: string, patch: Partial<Omit<Appointment, "id" | "createdAt">>) => void
  toggleAppointmentDone: (id: string, occISO: string) => void
  removeAppointment: (id: string) => void
  // Termin-Kategorien (editierbar)
  addAppointmentCategory: (input: Omit<AppointmentCategoryDef, "id">) => void
  updateAppointmentCategory: (id: string, patch: Partial<Omit<AppointmentCategoryDef, "id">>) => void
  removeAppointmentCategory: (id: string) => void
  // CRM
  addCustomer: (input: Omit<Customer, "id" | "createdAt">) => string
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id" | "createdAt">>) => void
  removeCustomer: (id: string) => void
  addProject: (input: Omit<Project, "id" | "createdAt">) => void
  updateProject: (id: string, patch: Partial<Omit<Project, "id" | "createdAt" | "customerId">>) => void
  removeProject: (id: string) => void
  // Pipeline
  addDeal: (input: Omit<Deal, "id" | "createdAt">) => void
  updateDeal: (id: string, patch: Partial<Omit<Deal, "id" | "createdAt">>) => void
  moveDeal: (id: string, stage: DealStage) => void
  reorderDeals: (next: Deal[]) => void
  removeDeal: (id: string) => void
  // Belege
  addQuote: (input: Omit<Quote, "id" | "createdAt" | "number">) => void
  updateQuote: (id: string, patch: Partial<Omit<Quote, "id" | "createdAt">>) => void
  removeQuote: (id: string) => void
  convertQuoteToInvoice: (quoteId: string) => void
  addInvoice: (input: Omit<Invoice, "id" | "createdAt" | "number">) => void
  updateInvoice: (id: string, patch: Partial<Omit<Invoice, "id" | "createdAt">>) => void
  removeInvoice: (id: string) => void
  voidInvoice: (id: string) => void
  sendDunning: (id: string) => void
  // Finanzen
  addTransaction: (input: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => void
  removeTransaction: (id: string) => void
  // Private Schulden
  addDebt: (input: Omit<Debt, "id" | "createdAt">) => void
  updateDebt: (id: string, patch: Partial<Omit<Debt, "id" | "createdAt">>) => void
  removeDebt: (id: string) => void
  payDebt: (id: string, amount: number) => void
  updateCompany: (patch: Partial<CompanySettings>) => void
  // Daten-Backup
  exportDb: () => string
  importDb: (json: string) => boolean
  // Whiteboard
  addWhiteboard: (input: Omit<Whiteboard, "id" | "createdAt">) => string
  renameWhiteboard: (id: string, name: string) => void
  removeWhiteboard: (id: string) => void
  // Notizen (Timeline bei Kunde/Deal)
  addNote: (input: Omit<Note, "id" | "createdAt">) => void
  removeNote: (id: string) => void
  // Zeiterfassung
  addTimeEntry: (input: Omit<TimeEntry, "id" | "createdAt">) => void
  removeTimeEntry: (id: string) => void
  // Vorlagen
  addTemplate: (input: Omit<Template, "id">) => void
  updateTemplate: (id: string, patch: Partial<Omit<Template, "id">>) => void
  removeTemplate: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => buildDemoData())
  const [activePerson, setActivePersonState] = useState<Person>("robert")
  const [hydrated, setHydrated] = useState(false)

  // Beim ersten Client-Render aus localStorage laden (sonst Demo-Seed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DB_KEY)
      const merged = raw ? mergeDb(JSON.parse(raw) as Partial<Database>) : withOverdue(buildDemoData())
      setDb(merged)
      const p = localStorage.getItem(PERSON_KEY) as Person | null
      if (p === "robert" || p === "bastian" || p === "martin") {
        setActivePersonState(p)
      } else {
        // Keine gespeicherte Auswahl → Standardperson aus den Einstellungen.
        setActivePersonState(merged.company.defaultPerson)
      }
    } catch {
      /* Demo-Seed bleibt bestehen */
    }
    setHydrated(true)
  }, [])

  // Persistieren, sobald hydratisiert.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db))
    } catch {
      /* ignore quota */
    }
  }, [db, hydrated])

  // Geteiltes Backend: lädt aus Supabase und hält alle Geräte synchron.
  // Ohne Env-Konfiguration ein No-op → lokaler Demo-Modus bleibt unverändert.
  useSupabaseSync(db, setDb)

  function setActivePerson(p: Person) {
    setActivePersonState(p)
    try {
      localStorage.setItem(PERSON_KEY, p)
    } catch {
      /* ignore */
    }
  }

  const value = useMemo<StoreValue>(
    () => ({
      db,
      activePerson,
      setActivePerson,
      addTask: (input) =>
        setDb((prev) => ({
          ...prev,
          tasks: [
            { ...input, id: nanoid(8), createdAt: new Date().toISOString() },
            ...prev.tasks,
          ],
        })),
      toggleTask: (id) =>
        setDb((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === id
              ? { ...t, status: t.status === "done" ? "todo" : "done" }
              : t,
          ),
        })),
      updateTaskStatus: (id, status) =>
        setDb((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      updateTask: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      reorderTasks: (next) => setDb((prev) => ({ ...prev, tasks: next })),
      removeTask: (id) =>
        setDb((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== id),
        })),
      addAppointment: (input) =>
        setDb((prev) => ({
          ...prev,
          appointments: [
            { ...input, id: nanoid(8), createdAt: new Date().toISOString() },
            ...prev.appointments,
          ],
        })),
      updateAppointment: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          appointments: prev.appointments.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        })),
      toggleAppointmentDone: (id, occISO) =>
        setDb((prev) => ({
          ...prev,
          appointments: prev.appointments.map((a) => {
            if (a.id !== id) return a
            const has = a.completedDates.includes(occISO)
            return {
              ...a,
              completedDates: has
                ? a.completedDates.filter((d) => d !== occISO)
                : [...a.completedDates, occISO],
            }
          }),
        })),
      removeAppointment: (id) =>
        setDb((prev) => ({
          ...prev,
          appointments: prev.appointments.filter((a) => a.id !== id),
        })),
      addAppointmentCategory: (input) =>
        setDb((prev) => ({
          ...prev,
          appointmentCategories: [...prev.appointmentCategories, { ...input, id: nanoid(8) }],
        })),
      updateAppointmentCategory: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          appointmentCategories: prev.appointmentCategories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeAppointmentCategory: (id) =>
        setDb((prev) => ({
          ...prev,
          // Termine dieser Kategorie auf "sonstiges" zurückfallen lassen.
          appointmentCategories: prev.appointmentCategories.filter((c) => c.id !== id),
          appointments: prev.appointments.map((a) => (a.category === id ? { ...a, category: "sonstiges" } : a)),
        })),

      // CRM
      addCustomer: (input) => {
        const id = nanoid(8)
        setDb((prev) => ({
          ...prev,
          customers: [
            { ...input, id, createdAt: new Date().toISOString() },
            ...prev.customers,
          ],
        }))
        return id
      },
      updateCustomer: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          customers: prev.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCustomer: (id) =>
        setDb((prev) => ({
          ...prev,
          customers: prev.customers.filter((c) => c.id !== id),
          projects: prev.projects.filter((p) => p.customerId !== id),
          deals: prev.deals.filter((d) => d.customerId !== id),
        })),
      addProject: (input) =>
        setDb((prev) => ({
          ...prev,
          projects: [
            { ...input, id: nanoid(8), createdAt: new Date().toISOString() },
            ...prev.projects,
          ],
        })),
      updateProject: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        setDb((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
        })),

      // Pipeline
      addDeal: (input) =>
        setDb((prev) =>
          withAutoQuotes(prev, [
            { ...input, id: nanoid(8), createdAt: new Date().toISOString(), stageChangedAt: new Date().toISOString() },
            ...prev.deals,
          ]),
        ),
      updateDeal: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          deals: prev.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      moveDeal: (id, stage) =>
        setDb((prev) =>
          withAutoQuotes(
            prev,
            prev.deals.map((d) => (d.id === id ? { ...d, stage, stageChangedAt: new Date().toISOString() } : d)),
          ),
        ),
      reorderDeals: (next) => setDb((prev) => withAutoQuotes(prev, next)),
      removeDeal: (id) =>
        setDb((prev) => ({
          ...prev,
          deals: prev.deals.filter((d) => d.id !== id),
        })),

      // Belege
      addQuote: (input) =>
        setDb((prev) => ({
          ...prev,
          quotes: [
            {
              ...input,
              id: nanoid(8),
              number: nextNumber(prev.quotes.map((q) => q.number), new Date().getFullYear()),
              createdAt: new Date().toISOString(),
            },
            ...prev.quotes,
          ],
        })),
      updateQuote: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          quotes: prev.quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        })),
      removeQuote: (id) =>
        setDb((prev) => ({ ...prev, quotes: prev.quotes.filter((q) => q.id !== id) })),
      convertQuoteToInvoice: (quoteId) =>
        setDb((prev) => {
          const q = prev.quotes.find((x) => x.id === quoteId)
          if (!q) return prev
          const issue = todayISO()
          const invoice: Invoice = {
            id: nanoid(8),
            number: nextNumber(prev.invoices.map((i) => i.number), new Date().getFullYear()),
            customerId: q.customerId,
            status: "entwurf",
            items: q.items.map((it) => ({ ...it, id: nanoid(6) })),
            issueDate: issue,
            dueDate: addDaysISO(issue, prev.company.paymentTermDays),
            person: q.person,
            notes: q.notes,
            quoteId: q.id,
            createdAt: new Date().toISOString(),
          }
          return {
            ...prev,
            invoices: [invoice, ...prev.invoices],
            quotes: prev.quotes.map((x) => (x.id === quoteId ? { ...x, status: "angenommen" } : x)),
          }
        }),
      addInvoice: (input) =>
        setDb((prev) => ({
          ...prev,
          invoices: [
            {
              ...input,
              id: nanoid(8),
              number: nextNumber(prev.invoices.map((i) => i.number), new Date().getFullYear()),
              createdAt: new Date().toISOString(),
            },
            ...prev.invoices,
          ],
        })),
      updateInvoice: (id, patch) =>
        setDb((prev) => {
          const before = prev.invoices.find((i) => i.id === id)
          const invoices = prev.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i))
          let transactions = prev.transactions
          // Statuswechsel auf "bezahlt" → automatisch als Einnahme ins Ledger buchen.
          if (before && patch.status && patch.status !== before.status) {
            const after = invoices.find((i) => i.id === id)!
            const becamePaid = patch.status === "bezahlt" && before.status !== "bezahlt"
            const leftPaid = before.status === "bezahlt" && patch.status !== "bezahlt"
            if (becamePaid && !transactions.some((t) => t.invoiceId === id)) {
              const totals = computeTotals(after.items)
              // Dominanter USt-Satz (größter Netto-Anteil) für die Ledger-Buchung.
              const topRate = totals.taxByRate.slice().sort((a, b) => b.net - a.net)[0]?.rate ?? prev.company.defaultTaxRate
              transactions = [
                {
                  id: nanoid(8),
                  type: "income",
                  category: "Rechnung",
                  amount: totals.gross,
                  taxRate: topRate,
                  date: todayISO(),
                  customerId: after.customerId,
                  invoiceId: id,
                  note: `Rechnung ${after.number}`,
                },
                ...transactions,
              ]
            }
            // Zurückgesetzt → verknüpfte Auto-Buchung wieder entfernen.
            if (leftPaid) {
              transactions = transactions.filter((t) => t.invoiceId !== id)
            }
          }
          return { ...prev, invoices, transactions }
        }),
      // Nur Entwürfe dürfen gelöscht werden — vergebene Nummern bleiben §14/GoBD-konform lückenlos.
      // Für gesendete/bezahlte Rechnungen siehe voidInvoice (Storno statt Löschung).
      removeInvoice: (id) =>
        setDb((prev) => ({
          ...prev,
          invoices: prev.invoices.filter((i) => i.id !== id || i.status !== "entwurf"),
        })),
      // Storniert eine versendete/bezahlte Rechnung: Original bleibt (Nummernkreis lückenlos),
      // eine neue Stornorechnung mit Negativpositionen wird als Gegenbuchung angelegt.
      voidInvoice: (id) =>
        setDb((prev) => {
          const original = prev.invoices.find((i) => i.id === id)
          if (!original || original.status === "entwurf" || original.voided) return prev
          const issue = todayISO()
          const creditNote: Invoice = {
            id: nanoid(8),
            number: nextNumber(prev.invoices.map((i) => i.number), new Date().getFullYear()),
            customerId: original.customerId,
            status: "bezahlt",
            items: original.items.map((it) => ({ ...it, id: nanoid(6), qty: -it.qty })),
            issueDate: issue,
            serviceDate: original.serviceDate,
            dueDate: issue,
            person: original.person,
            notes: `Storno zu Rechnung ${original.number}`,
            createdAt: new Date().toISOString(),
            creditNoteFor: original.id,
          }
          return {
            ...prev,
            invoices: [creditNote, ...prev.invoices.map((i) => (i.id === id ? { ...i, voided: true } : i))],
          }
        }),
      // Erhöht die Mahnstufe (max. 3) und protokolliert das Datum der Mahnung.
      sendDunning: (id) =>
        setDb((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) => {
            if (i.id !== id) return i
            const level = Math.min(3, ((i.dunningLevel ?? 0) + 1)) as 0 | 1 | 2 | 3
            return { ...i, dunningLevel: level, dunningDates: [...(i.dunningDates ?? []), new Date().toISOString()] }
          }),
        })),

      // Finanzen
      addTransaction: (input) =>
        setDb((prev) => ({
          ...prev,
          transactions: [{ ...input, id: nanoid(8) }, ...prev.transactions],
        })),
      updateTransaction: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTransaction: (id) =>
        setDb((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) })),

      // Private Schulden
      addDebt: (input) =>
        setDb((prev) => ({
          ...prev,
          debts: [{ ...input, id: nanoid(8), createdAt: new Date().toISOString() }, ...prev.debts],
        })),
      updateDebt: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          debts: prev.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeDebt: (id) =>
        setDb((prev) => ({ ...prev, debts: prev.debts.filter((d) => d.id !== id) })),
      payDebt: (id, amount) =>
        setDb((prev) => {
          const t = new Date()
          const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
          return {
            ...prev,
            debts: prev.debts.map((d) => {
              if (d.id !== id) return d
              const add = Math.min(amount, Math.max(0, d.total - d.paid))
              if (add <= 0) return d
              return { ...d, paid: d.paid + add, payments: [...(d.payments ?? []), { date: iso, amount: add }] }
            }),
          }
        }),

      updateCompany: (patch) =>
        setDb((prev) => ({ ...prev, company: { ...prev.company, ...patch } })),

      // Daten-Backup
      exportDb: () => JSON.stringify(db, null, 2),
      importDb: (json) => {
        try {
          const parsed = JSON.parse(json) as Partial<Database>
          if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.invoices)) return false
          setDb(mergeDb(parsed))
          return true
        } catch {
          return false
        }
      },

      // Whiteboard
      addWhiteboard: (input) => {
        const id = nanoid(8)
        setDb((prev) => ({
          ...prev,
          whiteboards: [...prev.whiteboards, { ...input, id, createdAt: new Date().toISOString() }],
        }))
        return id
      },
      renameWhiteboard: (id, name) =>
        setDb((prev) => ({
          ...prev,
          whiteboards: prev.whiteboards.map((w) => (w.id === id ? { ...w, name } : w)),
        })),
      removeWhiteboard: (id) =>
        setDb((prev) => ({ ...prev, whiteboards: prev.whiteboards.filter((w) => w.id !== id) })),

      // Notizen (Timeline bei Kunde/Deal)
      addNote: (input) =>
        setDb((prev) => ({
          ...prev,
          notes: [{ ...input, id: nanoid(8), createdAt: new Date().toISOString() }, ...prev.notes],
        })),
      removeNote: (id) =>
        setDb((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) })),

      // Zeiterfassung — erfasste Minuten fließen zusätzlich in Task.trackedMinutes ein.
      addTimeEntry: (input) =>
        setDb((prev) => ({
          ...prev,
          timeEntries: [{ ...input, id: nanoid(8), createdAt: new Date().toISOString() }, ...prev.timeEntries],
          tasks: input.taskId
            ? prev.tasks.map((t) =>
                t.id === input.taskId ? { ...t, trackedMinutes: (t.trackedMinutes ?? 0) + input.minutes } : t,
              )
            : prev.tasks,
        })),
      removeTimeEntry: (id) =>
        setDb((prev) => {
          const entry = prev.timeEntries.find((e) => e.id === id)
          return {
            ...prev,
            timeEntries: prev.timeEntries.filter((e) => e.id !== id),
            tasks: entry?.taskId
              ? prev.tasks.map((t) =>
                  t.id === entry.taskId ? { ...t, trackedMinutes: Math.max(0, (t.trackedMinutes ?? 0) - entry.minutes) } : t,
                )
              : prev.tasks,
          }
        }),

      // Vorlagen
      addTemplate: (input) =>
        setDb((prev) => ({ ...prev, templates: [{ ...input, id: nanoid(8) }, ...prev.templates] })),
      updateTemplate: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          templates: prev.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTemplate: (id) =>
        setDb((prev) => ({ ...prev, templates: prev.templates.filter((t) => t.id !== id) })),
    }),
    [db, activePerson],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
