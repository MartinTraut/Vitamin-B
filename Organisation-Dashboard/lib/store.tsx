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
  Person,
  Project,
  Quote,
  Task,
  TaskStatus,
  Transaction,
  Debt,
  Whiteboard,
} from "./types"
import { buildDemoData } from "./demo-data"
import { nextNumber, computeTotals } from "./totals"
import { todayISO, addDaysISO } from "./recurrence"
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

// Gespeicherte Daten über die Demo-Defaults mergen, damit neue (auch
// verschachtelte) Felder bei altem Cache vorhanden sind und nichts undefined wird.
function mergeDb(partial: Partial<Database>): Database {
  const base = buildDemoData()
  return withOverdue({
    ...base,
    ...partial,
    // Neues Feld: bei Bestandsdaten leer starten statt Demo-Schulden einzuspielen.
    debts: partial.debts ?? [],
    company: { ...base.company, ...(partial.company ?? {}) },
  })
}

interface StoreValue {
  db: Database
  activePerson: Person
  setActivePerson: (p: Person) => void
  addTask: (input: Omit<Task, "id" | "createdAt">) => void
  toggleTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
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
  // Finanzen
  addTransaction: (input: Omit<Transaction, "id">) => void
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
            { ...input, id: nanoid(8), createdAt: new Date().toISOString() },
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
          withAutoQuotes(prev, prev.deals.map((d) => (d.id === id ? { ...d, stage } : d))),
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
      removeInvoice: (id) =>
        setDb((prev) => ({ ...prev, invoices: prev.invoices.filter((i) => i.id !== id) })),

      // Finanzen
      addTransaction: (input) =>
        setDb((prev) => ({
          ...prev,
          transactions: [{ ...input, id: nanoid(8) }, ...prev.transactions],
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
