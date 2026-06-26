// Domänenmodell für das Vitamin-B Organisations-Dashboard.

export type Person = "robert" | "bastian" | "martin"

export interface PersonMeta {
  id: Person
  name: string
  role: string
  initials: string
  color: string
}

export const PEOPLE: PersonMeta[] = [
  { id: "robert", name: "Robert", role: "Inhaber & Creative Director", initials: "RB", color: "#E39832" },
  { id: "bastian", name: "Bastian", role: "Produktion & Werbetechnik", initials: "BA", color: "#3b82f6" },
  { id: "martin", name: "Martin", role: "Web & Digital", initials: "MA", color: "#a855f7" },
]

export type TaskStatus = "todo" | "doing" | "done"
export type Priority = "low" | "normal" | "high"

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Offen",
  doing: "In Arbeit",
  done: "Erledigt",
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
}

export interface TaskList {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  person: Person
  listId: string
  title: string
  notes?: string
  status: TaskStatus
  priority: Priority
  due?: string // YYYY-MM-DD
  createdAt: string // ISO
}

export type AppointmentCategory =
  | "termin"
  | "liefertermin"
  | "meeting"
  | "deadline"
  | "sonstiges"

export const CATEGORY_LABEL: Record<AppointmentCategory, string> = {
  termin: "Kundentermin",
  liefertermin: "Liefertermin",
  meeting: "Meeting",
  deadline: "Deadline",
  sonstiges: "Sonstiges",
}

export const CATEGORY_COLOR: Record<AppointmentCategory, string> = {
  termin: "#E39832",
  liefertermin: "#3b82f6",
  meeting: "#a855f7",
  deadline: "#ef4444",
  sonstiges: "#9ca3af",
}

export type RecurrenceFreq = "none" | "weekly" | "monthly" | "yearly"

export interface Recurrence {
  freq: RecurrenceFreq
  interval: number
}

export interface Appointment {
  id: string
  person: Person
  title: string
  category: AppointmentCategory
  date: string // YYYY-MM-DD (Anker)
  time?: string // HH:MM (Start)
  endTime?: string // HH:MM (Ende, optional)
  location?: string
  notes?: string
  recurrence: Recurrence
  completedDates: string[]
  createdAt: string
}

export interface FinanceMonth {
  month: string // "Jan", "Feb" ...
  income: number
  expense: number
}

// Anstehende Zahlung (Cashflow-Vorschau auf dem Dashboard)
export type CashflowKind = "income" | "expense"
export type CashflowStatus = "confirmed" | "potential" // potential = noch nicht fix (gelb)

export interface CashflowEvent {
  id: string
  kind: CashflowKind
  status: CashflowStatus
  title: string
  party?: string // Kunde / Empfänger
  amount: number
  date: string // YYYY-MM-DD (fällig / erwartet)
}

export const CASHFLOW_STATUS_LABEL: Record<CashflowStatus, string> = {
  confirmed: "Fix",
  potential: "Potenziell",
}

export interface Database {
  tasks: Task[]
  lists: TaskList[]
  appointments: Appointment[]
  finance: FinanceMonth[]
  cashflow: CashflowEvent[]
}
