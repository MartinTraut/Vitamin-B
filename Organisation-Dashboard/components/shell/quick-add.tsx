"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, CheckSquare, CalendarClock, Receipt } from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/lib/toast"
import {
  PRIORITY_LABEL,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Priority,
  type TxType,
} from "@/lib/types"
import { todayISO } from "@/lib/recurrence"
import { parseAmountDE } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { INCOME, EXPENSE, ORANGE, BLUE, NEUTRAL } from "@/lib/theme-colors"

type Tab = "task" | "appt" | "tx"

const PRIORITY_DOT: Record<Priority, string> = { high: EXPENSE, normal: ORANGE, low: NEUTRAL }

// Schwebender Schnell-Erfassen-Button (nur Mobile/Tablet). Erfasst Aufgabe,
// Termin oder Buchung direkt von jeder Ansicht aus, ohne Navigation.
export function QuickAdd() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("task")

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  // Desktop-Zugang: ⌘⇧A / Strg⇧A sowie ein Event, das die Topbar auslöst
  // (gleiche Komponente wie die Mobile-FAB, nur ohne festen Trigger-Button).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener("keydown", onKey)
    window.addEventListener("open-quick-add", onOpen)
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("open-quick-add", onOpen)
    }
  }, [])

  return (
    <>
      {/* FAB — Mobile/Tablet. Desktop nutzt den Button in der Topbar (gleiche Komponente). */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Schnell erfassen"
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Schnell erfassen">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
              <div className="mb-4 flex items-center justify-between">
                <span className="font-heading text-base font-semibold">Schnell erfassen</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Schließen"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mb-4 grid grid-cols-3 gap-2">
                <TabBtn active={tab === "task"} onClick={() => setTab("task")} icon={<CheckSquare className="h-4 w-4" />} label="Aufgabe" accent={ORANGE} />
                <TabBtn active={tab === "appt"} onClick={() => setTab("appt")} icon={<CalendarClock className="h-4 w-4" />} label="Termin" accent={BLUE} />
                <TabBtn active={tab === "tx"} onClick={() => setTab("tx")} icon={<Receipt className="h-4 w-4" />} label="Buchung" accent={INCOME} />
              </div>

              {tab === "task" && <TaskForm onDone={() => setOpen(false)} />}
              {tab === "appt" && <ApptForm onDone={() => setOpen(false)} />}
              {tab === "tx" && <TxForm onDone={() => setOpen(false)} />}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function TabBtn({ active, onClick, icon, label, accent }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; accent: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
        active ? "border-transparent" : "border-border text-muted-foreground",
      )}
      style={active ? { backgroundColor: `${accent}1f`, color: accent } : undefined}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------- Aufgabe ---------- */
function TaskForm({ onDone }: { onDone: () => void }) {
  const { db, activePerson, addTask } = useStore()
  const toast = useToast()
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("normal")
  // Optionales Fälligkeitsdatum — steuert Dashboard-Nudges, Fokus-Modus und Kalender.
  const [due, setDue] = useState("")

  function save() {
    const v = title.trim()
    if (!v) return
    addTask({ person: activePerson, listId: db.lists[0]?.id ?? "l-orga", title: v, status: "todo", priority, due: due || undefined })
    toast.success("Aufgabe erfasst")
    onDone()
  }

  return (
    <div className="space-y-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Was ist zu tun?"
        className="h-12 w-full rounded-xl border border-border bg-white/[0.03] px-4 text-base outline-none focus:border-primary/50"
      />
      <div className="grid grid-cols-3 gap-2">
        {(["low", "normal", "high"] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={cn("h-11 rounded-xl border text-sm font-medium transition-colors", priority === p ? "border-primary/50 bg-primary/10" : "border-border text-muted-foreground")}
          >
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: PRIORITY_DOT[p] }} />
            {PRIORITY_LABEL[p]}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] text-muted-foreground">Fällig am (optional)</span>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
      </label>
      <Button onClick={save} className="h-12 w-full">Aufgabe speichern</Button>
    </div>
  )
}

/* ---------- Termin ---------- */
function ApptForm({ onDone }: { onDone: () => void }) {
  const { db, activePerson, addAppointment } = useStore()
  const toast = useToast()
  const cats = db.appointmentCategories
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState("")
  const [category, setCategory] = useState(cats[0]?.id ?? "termin")

  function save() {
    const v = title.trim()
    if (!v) return
    addAppointment({
      person: activePerson,
      recurrence: { freq: "none", interval: 1 },
      completedDates: [],
      title: v,
      category,
      date,
      time: time || undefined,
    })
    toast.success("Termin erfasst")
    onDone()
  }

  return (
    <div className="space-y-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel des Termins"
        className="h-12 w-full rounded-xl border border-border bg-white/[0.03] px-4 text-base outline-none focus:border-primary/50"
      />
      <div className="flex flex-wrap gap-1.5">
        {cats.map((c) => {
          const sel = category === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all"
              style={sel ? { backgroundColor: `${c.color}26`, color: c.color, borderColor: c.color } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--muted-foreground)" }}
            >
              {c.label}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[11px] text-muted-foreground">Datum</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[11px] text-muted-foreground">Uhrzeit (optional)</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
        </label>
      </div>
      <Button onClick={save} className="h-12 w-full">Termin speichern</Button>
    </div>
  )
}

/* ---------- Buchung ---------- */
function TxForm({ onDone }: { onDone: () => void }) {
  const { addTransaction } = useStore()
  const toast = useToast()
  const [type, setType] = useState<TxType>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [taxRate, setTaxRate] = useState(19)
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState(false)
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function save() {
    const val = parseAmountDE(amount)
    if (!Number.isFinite(val) || val <= 0) { setError(true); return }
    addTransaction({ type, category, amount: val, taxRate, date })
    toast.success(type === "income" ? "Einnahme erfasst" : "Ausgabe erfasst")
    onDone()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => { setType("expense"); setCategory(EXPENSE_CATEGORIES[0]) }} className={cn("h-11 flex-1 rounded-xl border text-sm font-medium transition-colors", type === "expense" ? "border-transparent" : "border-border text-muted-foreground")} style={type === "expense" ? { backgroundColor: `${EXPENSE}26`, color: EXPENSE } : undefined}>Ausgabe</button>
        <button onClick={() => { setType("income"); setCategory(INCOME_CATEGORIES[0]) }} className={cn("h-11 flex-1 rounded-xl border text-sm font-medium transition-colors", type === "income" ? "border-transparent" : "border-border text-muted-foreground")} style={type === "income" ? { backgroundColor: `${INCOME}26`, color: INCOME } : undefined}>Einnahme</button>
      </div>
      <input
        autoFocus
        value={amount}
        onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.,]/g, "")); setError(false) }}
        inputMode="decimal"
        placeholder="Betrag € (brutto)"
        className={cn("h-12 w-full rounded-xl border bg-white/[0.03] px-4 text-base outline-none focus:border-primary/50", error ? "border-destructive" : "border-border")}
      />
      <div className="flex gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 flex-1 rounded-xl border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="h-11 rounded-xl border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          <option value={19}>19%</option>
          <option value={7}>7%</option>
          <option value={0}>0%</option>
        </select>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] text-muted-foreground">Datum</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
      </label>
      <Button onClick={save} className="h-12 w-full">Buchung speichern</Button>
    </div>
  )
}
