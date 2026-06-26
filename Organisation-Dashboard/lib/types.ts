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

/* ---------- CRM ---------- */

export type CustomerHealth = "lead" | "active" | "churned"

export const HEALTH_LABEL: Record<CustomerHealth, string> = {
  lead: "Lead",
  active: "Aktiv",
  churned: "Inaktiv",
}
export const HEALTH_COLOR: Record<CustomerHealth, string> = {
  lead: "#3b82f6",
  active: "#34d399",
  churned: "#9ca3af",
}

export interface Customer {
  id: string
  company: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  source?: string // Herkunft
  health: CustomerHealth
  notes?: string
  createdAt: string
}

export type ProjectStatus = "geplant" | "laufend" | "fertig"

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  geplant: "Geplant",
  laufend: "Laufend",
  fertig: "Fertig",
}
export const PROJECT_STATUS_COLOR: Record<ProjectStatus, string> = {
  geplant: "#9ca3af",
  laufend: "#E39832",
  fertig: "#34d399",
}

export interface Project {
  id: string
  customerId: string
  name: string
  status: ProjectStatus
  description?: string
  createdAt: string
}

/* ---------- Pipeline ---------- */

export type DealStage = "lead" | "kontakt" | "angebot" | "gewonnen"

export const DEAL_STAGES: DealStage[] = ["lead", "kontakt", "angebot", "gewonnen"]

export const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  lead: "Lead",
  kontakt: "Kontaktiert",
  angebot: "Angebot",
  gewonnen: "Gewonnen",
}
export const DEAL_STAGE_COLOR: Record<DealStage, string> = {
  lead: "#9ca3af",
  kontakt: "#3b82f6",
  angebot: "#E39832",
  gewonnen: "#34d399",
}

export interface Deal {
  id: string
  customerId: string
  title: string
  stage: DealStage
  value: number
  person: Person
  createdAt: string
}

/* ---------- Belege (Angebote & Rechnungen) ---------- */

export type Unit = "Stk" | "Std" | "m²" | "lfm" | "pausch."

export const UNITS: Unit[] = ["Stk", "Std", "m²", "lfm", "pausch."]

export interface LineItem {
  id: string
  description: string
  qty: number
  unit: Unit
  price: number // Einzelpreis netto
  taxRate: number // 19 | 7 | 0
}

export type QuoteStatus = "entwurf" | "gesendet" | "angenommen" | "abgelehnt"
export type InvoiceStatus = "entwurf" | "gesendet" | "bezahlt" | "ueberfaellig"

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  entwurf: "Entwurf",
  gesendet: "Gesendet",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
}
export const QUOTE_STATUS_COLOR: Record<QuoteStatus, string> = {
  entwurf: "#9ca3af",
  gesendet: "#3b82f6",
  angenommen: "#34d399",
  abgelehnt: "#ef4444",
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  entwurf: "Entwurf",
  gesendet: "Gesendet",
  bezahlt: "Bezahlt",
  ueberfaellig: "Überfällig",
}
export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, string> = {
  entwurf: "#9ca3af",
  gesendet: "#3b82f6",
  bezahlt: "#34d399",
  ueberfaellig: "#ef4444",
}

export interface Quote {
  id: string
  number: string
  customerId: string
  status: QuoteStatus
  items: LineItem[]
  validUntil: string
  person: Person
  notes?: string
  createdAt: string
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  status: InvoiceStatus
  items: LineItem[]
  issueDate: string
  dueDate: string
  person: Person
  notes?: string
  quoteId?: string
  createdAt: string
}

export interface Template {
  id: string
  kind: "quote" | "invoice"
  name: string
  items: Omit<LineItem, "id">[]
}

/* ---------- Finanzen (Ledger) ---------- */

export type TxType = "income" | "expense"

export interface Transaction {
  id: string
  type: TxType
  category: string
  amount: number // brutto
  taxRate: number // 19 | 7 | 0
  date: string
  customerId?: string
  invoiceId?: string
  note?: string
}

export const EXPENSE_CATEGORIES = ["Material", "Miete", "Fahrzeuge", "Software", "Marketing", "Personal", "Steuern", "Sonstiges"]
export const INCOME_CATEGORIES = ["Beschriftung", "Folierung", "Druck", "Design", "Web", "Wartung", "Sonstiges"]

export interface CompanySettings {
  name: string
  owner: string
  address: string
  taxId: string
  iban: string
  bank: string
  email: string
  phone: string
  // Geschäfts-Defaults (in Einstellungen pflegbar)
  defaultTaxRate: number // Standard-USt-Satz für neue Positionen (19 | 7 | 0)
  paymentTermDays: number // Standard-Zahlungsziel in Tagen
  defaultPerson: Person // Startansicht beim Öffnen
}

/* ---------- Whiteboard ---------- */

export interface Whiteboard {
  id: string
  name: string
  person?: Person // optional zugeordnet, sonst Team
  createdAt: string
}

export interface Database {
  tasks: Task[]
  lists: TaskList[]
  appointments: Appointment[]
  finance: FinanceMonth[]
  cashflow: CashflowEvent[]
  customers: Customer[]
  projects: Project[]
  deals: Deal[]
  quotes: Quote[]
  invoices: Invoice[]
  transactions: Transaction[]
  templates: Template[]
  company: CompanySettings
  whiteboards: Whiteboard[]
}
