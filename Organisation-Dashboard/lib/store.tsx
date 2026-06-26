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
  Database,
  Person,
  Task,
  TaskStatus,
} from "./types"
import { buildDemoData } from "./demo-data"

const DB_KEY = "vitaminb-os-db-v1"
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
