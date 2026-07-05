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
  projectId?: string // verknüpftes Kundenprojekt (Work-OS-Verknüpfung)
  customerId?: string // direkter Kundenbezug, falls kein Projekt existiert
  trackedMinutes?: number // aufsummierte Zeiterfassung (aus TimeEntry)
}

// Zeiterfassung — an Task oder direkt an Projekt hängbar.
export interface TimeEntry {
  id: string
  person: Person
  taskId?: string
  projectId?: string
  minutes: number
  date: string // YYYY-MM-DD
  note?: string
  createdAt: string
}

// Kategorie-ID (referenziert eine editierbare AppointmentCategoryDef).
export type AppointmentCategory = string

export interface AppointmentCategoryDef {
  id: string
  label: string
  color: string
}

export const DEFAULT_APPOINTMENT_CATEGORIES: AppointmentCategoryDef[] = [
  { id: "termin", label: "Kundentermin", color: "#E39832" },
  { id: "liefertermin", label: "Liefertermin", color: "#3b82f6" },
  { id: "meeting", label: "Meeting", color: "#a855f7" },
  { id: "deadline", label: "Deadline", color: "#ef4444" },
  { id: "sonstiges", label: "Sonstiges", color: "#9ca3af" },
]

// Farbauswahl für Kategorien (und allgemein Status-/Akzent-Markierungen).
export const CATEGORY_COLOR_PALETTE = [
  "#E39832", "#f59e0b", "#ef4444", "#ec4899", "#a855f7",
  "#6366f1", "#3b82f6", "#14b8a6", "#34d399", "#9ca3af",
]

// Fallback, falls eine Kategorie-ID nicht (mehr) existiert.
export const CATEGORY_FALLBACK: AppointmentCategoryDef = { id: "sonstiges", label: "Sonstiges", color: "#9ca3af" }

export function resolveCategory(cats: AppointmentCategoryDef[], id: string): AppointmentCategoryDef {
  return cats.find((c) => c.id === id) ?? CATEGORY_FALLBACK
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
  customerId?: string // Work-OS-Verknüpfung
  dealId?: string
  projectId?: string
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

// Angehaengte Datei/Bild — als Data-URL gespeichert (laeuft so durch den
// lokalen Demo-Store und die Supabase-Synchronisation). Fuer kleine Dateien
// gedacht; grosse Uploads werden in der UI begrenzt.
export interface ProjectFile {
  id: string
  name: string
  type: string // MIME-Type, z. B. "image/png" oder "application/pdf"
  size: number // Bytes
  dataUrl: string
  createdAt: string
}

export interface Project {
  id: string
  customerId: string
  name: string
  status: ProjectStatus
  description?: string
  attachments?: ProjectFile[]
  createdAt: string
}

/* ---------- Pipeline ---------- */

export type DealStage = "lead" | "kontakt" | "angebot" | "gewonnen"

export const DEAL_STAGES: DealStage[] = ["lead", "kontakt", "angebot", "gewonnen"]

export const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  lead: "Potenzieller Lead",
  kontakt: "Kontaktiert",
  angebot: "Angebot",
  gewonnen: "Abgeschlossen",
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
  note?: string // kurze Notiz, v. a. für selbst erfasste Leads
  phone?: string // Kontakt (v. a. bei selbst erfassten Leads)
  email?: string
  createdAt: string
  probability?: number // 0–100, für gewichtete Pipeline (fehlt → Default aus Stage)
  expectedCloseDate?: string // YYYY-MM-DD
  stageChangedAt?: string // ISO, für Follow-up-Nudges ("seit X Tagen keine Bewegung")
  lostAt?: string // ISO, gesetzt wenn der Deal als verloren markiert wurde
  lostReason?: string // Verlustgrund (Win/Loss-Analyse)
}

// Default-Abschlusswahrscheinlichkeit je Pipeline-Stufe, falls Deal.probability nicht gesetzt ist.
export const DEAL_STAGE_DEFAULT_PROBABILITY: Record<DealStage, number> = {
  lead: 10,
  kontakt: 35,
  angebot: 65,
  gewonnen: 100,
}

/* ---------- Notizen (chronologische Timeline bei Kunde/Deal) ---------- */

export interface Note {
  id: string
  customerId?: string
  dealId?: string
  person: Person
  text: string
  createdAt: string // ISO
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
  dealId?: string // verknüpfter Pipeline-Deal
  createdAt: string
}

export type DunningLevel = 0 | 1 | 2 | 3

export const DUNNING_LABEL: Record<DunningLevel, string> = {
  0: "Keine Mahnung",
  1: "1. Mahnung",
  2: "2. Mahnung",
  3: "3. Mahnung",
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  status: InvoiceStatus
  items: LineItem[]
  issueDate: string
  serviceDate?: string // Leistungs-/Lieferdatum (§14 UStG Pflicht). Fehlt → entspricht issueDate
  dueDate: string
  person: Person
  notes?: string
  quoteId?: string
  createdAt: string
  recurrence?: Recurrence // wiederkehrende Rechnung (z. B. monatlicher Wartungsvertrag)
  recurrenceParentId?: string // verweist auf die "Vorlagen"-Rechnung, aus der Folgerechnungen generiert werden
  nextRecurrenceDate?: string // YYYY-MM-DD — wann die nächste Folgerechnung fällig ist
  dunningLevel?: DunningLevel
  dunningDates?: string[] // ISO, ein Eintrag pro versendeter Mahnstufe
  voided?: boolean // storniert (Original bleibt für Nummernkreis erhalten, siehe creditNoteFor)
  creditNoteFor?: string // gesetzt bei einer Stornorechnung: id der stornierten Original-Rechnung
}

export interface Template {
  id: string
  kind: "quote" | "invoice"
  name: string
  items: Omit<LineItem, "id">[]
}

/* ---------- Finanzen (Ledger) ---------- */

export type TxType = "income" | "expense"

// Geschäftlich (Firma, teamweit) vs. privat (pro Person). Fehlt das Feld,
// gilt die Buchung als geschäftlich — so bleiben Altdaten unverändert.
export type TxScope = "business" | "private"

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
  scope?: TxScope // undefined = "business"
  person?: Person // nur bei scope "private" gesetzt (Eigentümer)
}

export const EXPENSE_CATEGORIES = ["Material", "Miete", "Fahrzeuge", "Software", "Marketing", "Personal", "Steuern", "Sonstiges"]
export const INCOME_CATEGORIES = ["Beschriftung", "Folierung", "Druck", "Design", "Web", "Wartung", "Sonstiges"]

// Private Kategorien (pro Person, getrennt von der Firma)
export const PRIVATE_EXPENSE_CATEGORIES = ["Wohnen", "Lebensmittel", "Mobilität", "Versicherung", "Freizeit", "Gesundheit", "Abos", "Kredit/Rate", "Sonstiges"]
export const PRIVATE_INCOME_CATEGORIES = ["Gehalt", "Entnahme", "Nebenjob", "Erstattung", "Sonstiges"]

/* ---------- Private Schulden ---------- */

export interface DebtPayment {
  date: string // YYYY-MM-DD
  amount: number
}

export interface Debt {
  id: string
  person: Person
  title: string // Gläubiger / Zweck, z. B. "Autokredit Sparkasse"
  total: number // Gesamtbetrag
  paid: number // bereits getilgt (kumuliert)
  monthlyRate?: number // optionale monatliche Rate
  payments?: DebtPayment[] // datierte Tilgungen → Schulden-Verlaufskurve
  note?: string
  createdAt: string
}

export interface CompanySettings {
  name: string
  owner: string
  address: string
  taxId: string
  iban: string
  bic?: string // BIC/SWIFT der Bank — gehört zu einer vollständigen Zahlungsangabe
  bank: string
  email: string
  phone: string
  // Geschäfts-Defaults (in Einstellungen pflegbar)
  defaultTaxRate: number // Standard-USt-Satz für neue Positionen (19 | 7 | 0)
  paymentTermDays: number // Standard-Zahlungsziel in Tagen
  defaultPerson: Person // Startansicht beim Öffnen
  accent: string // Akzentfarbe der Oberfläche (Hex)
}

// Kuratierte Akzentfarben für den Umschalter in den Einstellungen.
export const ACCENTS: { name: string; value: string }[] = [
  { name: "Vitamin-Orange", value: "#E39832" },
  { name: "Bernstein", value: "#f59e0b" },
  { name: "Smaragd", value: "#10b981" },
  { name: "Azur", value: "#3b82f6" },
  { name: "Violett", value: "#8b5cf6" },
  { name: "Karmin", value: "#f43f5e" },
]

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
  appointmentCategories: AppointmentCategoryDef[]
  finance: FinanceMonth[]
  cashflow: CashflowEvent[]
  customers: Customer[]
  projects: Project[]
  deals: Deal[]
  quotes: Quote[]
  invoices: Invoice[]
  transactions: Transaction[]
  debts: Debt[]
  templates: Template[]
  company: CompanySettings
  whiteboards: Whiteboard[]
  notes: Note[]
  timeEntries: TimeEntry[]
}
