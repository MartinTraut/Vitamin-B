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
} from "./types"
import { buildDemoData } from "./demo-data"
import { nextNumber } from "./totals"

const DB_KEY = "vitaminb-os-db-v2"
const PERSON_KEY = "vitaminb-active-person"

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
  // CRM
  addCustomer: (input: Omit<Customer, "id" | "createdAt">) => void
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id" | "createdAt">>) => void
  removeCustomer: (id: string) => void
  addProject: (input: Omit<Project, "id" | "createdAt">) => void
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
  updateCompany: (patch: Partial<CompanySettings>) => void
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
      // Über die Demo-Defaults mergen, damit neue Felder (z.B. cashflow)
      // auch bei altem Cache vorhanden sind und nichts undefined wird.
      if (raw) setDb({ ...buildDemoData(), ...(JSON.parse(raw) as Partial<Database>) } as Database)
      const p = localStorage.getItem(PERSON_KEY) as Person | null
      if (p === "robert" || p === "bastian" || p === "martin") {
        setActivePersonState(p)
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

      // CRM
      addCustomer: (input) =>
        setDb((prev) => ({
          ...prev,
          customers: [
            { ...input, id: nanoid(8), createdAt: new Date().toISOString() },
            ...prev.customers,
          ],
        })),
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
      removeProject: (id) =>
        setDb((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
        })),

      // Pipeline
      addDeal: (input) =>
        setDb((prev) => ({
          ...prev,
          deals: [
            { ...input, id: nanoid(8), createdAt: new Date().toISOString() },
            ...prev.deals,
          ],
        })),
      updateDeal: (id, patch) =>
        setDb((prev) => ({
          ...prev,
          deals: prev.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      moveDeal: (id, stage) =>
        setDb((prev) => ({
          ...prev,
          deals: prev.deals.map((d) => (d.id === id ? { ...d, stage } : d)),
        })),
      reorderDeals: (next) => setDb((prev) => ({ ...prev, deals: next })),
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
          const today = new Date()
          const due = new Date()
          due.setDate(today.getDate() + 14)
          const iso = (d: Date) => d.toISOString().slice(0, 10)
          const invoice: Invoice = {
            id: nanoid(8),
            number: nextNumber(prev.invoices.map((i) => i.number), today.getFullYear()),
            customerId: q.customerId,
            status: "entwurf",
            items: q.items.map((it) => ({ ...it, id: nanoid(6) })),
            issueDate: iso(today),
            dueDate: iso(due),
            person: q.person,
            notes: q.notes,
            quoteId: q.id,
            createdAt: today.toISOString(),
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
        setDb((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
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
      updateCompany: (patch) =>
        setDb((prev) => ({ ...prev, company: { ...prev.company, ...patch } })),
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
