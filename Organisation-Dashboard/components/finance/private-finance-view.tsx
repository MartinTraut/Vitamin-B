"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Plus, TrendingUp, TrendingDown, Wallet, Landmark, Trash2, ArrowDownLeft, ArrowUpRight,
  ChevronRight, CreditCard, X,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/lib/toast"
import { useDialog } from "@/lib/dialog"
import {
  PEOPLE,
  PRIVATE_EXPENSE_CATEGORIES,
  PRIVATE_INCOME_CATEGORIES,
  type TxType,
  type Transaction,
  type Debt,
} from "@/lib/types"
import { eur, eur0, dateDE } from "@/lib/format"
import { todayISO } from "@/lib/recurrence"
import { buildSeries, GRAN_LABEL, type Gran } from "@/lib/finance-series"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FinanceChart, CategoryDonut } from "@/components/dashboard/charts"
import { cn } from "@/lib/utils"

const INCOME = "#34d399"
const EXPENSE = "#ef4444"
const ACCENT = "#a855f7" // privat = violett, klar getrennt von der Firma (grün)
const DEBT = "#f59e0b"

function parseAmount(s: string): number {
  let t = s.trim()
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".")
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

export function PrivateFinanceView() {
  const { db, activePerson, addTransaction, removeTransaction } = useStore()
  const person = PEOPLE.find((p) => p.id === activePerson)!
  const [adding, setAdding] = useState(false)
  const [gran, setGran] = useState<Gran>("month")

  // Nur private Buchungen der aktiven Person.
  const myTx = useMemo(
    () => db.transactions.filter((t) => t.scope === "private" && t.person === activePerson),
    [db.transactions, activePerson],
  )
  const myDebts = useMemo(
    () => db.debts.filter((d) => d.person === activePerson),
    [db.debts, activePerson],
  )

  const m = useMemo(() => {
    const income = myTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const expense = myTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const byCat = new Map<string, number>()
    for (const t of myTx) if (t.type === "expense") byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount)
    const cats = [...byCat.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    const debtRemaining = myDebts.reduce((s, d) => s + Math.max(0, d.total - d.paid), 0)
    return {
      income, expense, saldo: income - expense, debtRemaining, cats,
      sorted: [...myTx].sort((a, b) => b.date.localeCompare(a.date)),
    }
  }, [myTx, myDebts])

  // Schulden fließen als negative Fläche in denselben Verlauf-Chart ein.
  const chartData = useMemo(() => buildSeries(myTx, gran, myDebts), [myTx, gran, myDebts])

  return (
    <div className="space-y-4">
      {/* Kontext-Banner: wessen private Finanzen */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
        style={{ background: `linear-gradient(135deg, ${person.color}24, ${person.color}08 70%)`, borderColor: `${person.color}4d` }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold" style={{ backgroundColor: `${person.color}26`, color: person.color, border: `1px solid ${person.color}55` }}>
            {person.initials}
          </span>
          <div className="min-w-0">
            <div className="font-heading text-base font-bold">Private Finanzen · {person.name}</div>
            <div className="text-xs text-muted-foreground">Streng getrennt von den Firmen-Finanzen · oben rechts die Person wechseln</div>
          </div>
        </div>
        <Link href="/finanzen" className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          Firmen-Finanzen →
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={TrendingUp} label="Einnahmen" value={eur0(m.income)} accent={INCOME} />
        <Kpi icon={TrendingDown} label="Ausgaben" value={eur0(m.expense)} accent={EXPENSE} />
        <Kpi icon={Wallet} label="Saldo" value={eur0(m.saldo)} accent={m.saldo >= 0 ? INCOME : EXPENSE} />
        <Kpi icon={Landmark} label="Restschulden" value={eur0(m.debtRemaining)} accent={DEBT} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Verlauf */}
        <Card className="flex flex-col lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 pb-2">
            <h3 className="font-heading text-base font-bold">Verlauf · privat</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: INCOME }} />Einnahmen</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: EXPENSE }} />Ausgaben</span>
                {myDebts.length > 0 && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: DEBT }} />Schulden</span>}
              </div>
              <div className="flex items-center rounded-lg border border-border bg-white/[0.03] p-0.5">
                {(["day", "week", "month"] as Gran[]).map((g) => (
                  <button key={g} onClick={() => setGran(g)} aria-pressed={gran === g} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold transition-colors", gran === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                    {GRAN_LABEL[g]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="min-h-[240px] flex-1 p-3 pt-1">
            <FinanceChart data={chartData} height="full" />
          </div>
        </Card>

        {/* Ausgaben nach Kategorie */}
        <Card className="p-4">
          <h3 className="mb-3 font-heading text-base font-bold">Ausgaben nach Kategorie</h3>
          <CategoryDonut data={m.cats} />
        </Card>
      </div>

      {/* Schulden */}
      <DebtSection personId={activePerson} debts={myDebts} />

      {/* Buchungen */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-heading text-base font-bold">Private Buchungen</h3>
          <Button size="sm" onClick={() => setAdding((v) => !v)}>
            <Plus className="h-4 w-4" /> Buchung
          </Button>
        </div>
        {adding && (
          <AddPrivateTx
            onCancel={() => setAdding(false)}
            onSave={(input) => { addTransaction({ ...input, scope: "private", person: activePerson }); setAdding(false) }}
          />
        )}
        <div className="divide-y divide-border">
          {m.sorted.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Noch keine privaten Buchungen.</p>}
          {m.sorted.map((t) => {
            const inc = t.type === "income"
            return (
              <div key={t.id} className="group flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${inc ? INCOME : EXPENSE}1f`, color: inc ? INCOME : EXPENSE }}>
                  {inc ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{t.category}{t.note ? <span className="font-normal text-muted-foreground"> · {t.note}</span> : ""}</div>
                  <div className="text-xs text-muted-foreground">{dateDE(t.date)}</div>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: inc ? INCOME : EXPENSE }}>
                  {inc ? "+" : "−"}{eur(t.amount)}
                </span>
                <button onClick={() => removeTransaction(t.id)} aria-label="Buchung löschen" title="Buchung löschen" className="action-reveal rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/* ---------- Schulden ---------- */

function DebtSection({ personId, debts }: { personId: Debt["person"]; debts: Debt[] }) {
  const { addDebt } = useStore()
  const [adding, setAdding] = useState(false)
  const totalRemaining = debts.reduce((s, d) => s + Math.max(0, d.total - d.paid), 0)
  const monthlyTotal = debts.reduce((s, d) => s + (d.monthlyRate ?? 0), 0)

  return (
    <Card className="overflow-hidden" style={{ borderColor: `${DEBT}3a` }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4" style={{ borderColor: `${DEBT}26`, background: `linear-gradient(180deg, ${DEBT}1a, ${DEBT}06)` }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${DEBT}24`, color: DEBT, border: `1px solid ${DEBT}55` }}>
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold">Private Schulden</h3>
            <div className="text-sm text-muted-foreground">
              Offen gesamt <span className="font-bold" style={{ color: DEBT }}>{eur0(totalRemaining)}</span>
              {monthlyTotal > 0 && <> · Raten/Monat {eur0(monthlyTotal)}</>}
            </div>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" /> Schuld
        </Button>
      </div>

      {adding && (
        <AddDebtForm onCancel={() => setAdding(false)} onSave={(input) => { addDebt({ ...input, person: personId }); setAdding(false) }} />
      )}

      <div className="grid gap-3 p-4 lg:grid-cols-2">
        {debts.length === 0 && <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground lg:col-span-2">Keine offenen Schulden erfasst. 🎉</p>}
        {debts.map((d) => <DebtCard key={d.id} debt={d} />)}
      </div>
    </Card>
  )
}

function DebtCard({ debt }: { debt: Debt }) {
  const { updateDebt, removeDebt, payDebt } = useStore()
  const dialog = useDialog()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(debt.title)
  const [total, setTotal] = useState(String(debt.total))
  const [rate, setRate] = useState(debt.monthlyRate ? String(debt.monthlyRate) : "")

  const remaining = Math.max(0, debt.total - debt.paid)
  const pct = debt.total > 0 ? Math.min(100, Math.round((debt.paid / debt.total) * 100)) : 0
  const done = remaining <= 0

  async function payRate() {
    const def = debt.monthlyRate ? String(debt.monthlyRate) : ""
    const v = await dialog.prompt({ title: "Tilgung verbuchen", message: `Wie viel wurde auf „${debt.title}" getilgt?`, defaultValue: def, placeholder: "Betrag €", confirmLabel: "Verbuchen" })
    if (!v) return
    const amount = parseAmount(v)
    if (!Number.isFinite(amount) || amount <= 0) return
    payDebt(debt.id, amount)
    toast.success("Tilgung verbucht")
  }
  async function remove() {
    const ok = await dialog.confirm({ title: "Schuld löschen?", message: `„${debt.title}" wird entfernt.`, confirmLabel: "Löschen", danger: true })
    if (ok) removeDebt(debt.id)
  }
  function commitEdit() {
    const t = parseAmount(total)
    const r = rate.trim() ? parseAmount(rate) : undefined
    updateDebt(debt.id, {
      title: name.trim() || debt.title,
      total: Number.isFinite(t) && t > 0 ? t : debt.total,
      monthlyRate: r && Number.isFinite(r) && r > 0 ? r : undefined,
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: done ? `${INCOME}44` : `${DEBT}33`, background: done ? `${INCOME}0d` : `${DEBT}0d` }}>
      <div className="flex items-start gap-2.5 p-3.5 pb-2.5">
        <button onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0 transition-transform", open && "rotate-90")} style={{ color: done ? INCOME : DEBT }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold leading-tight">{debt.title}</span>
            <span className="block text-[13px] text-muted-foreground">
              {eur0(debt.paid)} / {eur0(debt.total)}{debt.monthlyRate ? ` · ${eur0(debt.monthlyRate)}/Mt.` : ""}
            </span>
          </span>
        </button>
        <div className="shrink-0 text-right">
          <div className="num font-heading text-xl font-bold leading-none" style={{ color: done ? INCOME : DEBT }}>{done ? "Getilgt" : eur0(remaining)}</div>
          {!done && <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">offen</div>}
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="px-3.5 pb-3.5">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: done ? INCOME : DEBT }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">{pct}% getilgt</span>
          {!done && (
            <button onClick={payRate} className="font-bold transition-colors hover:brightness-110" style={{ color: DEBT }}>
              + Tilgung
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      {open && (
        <div className="space-y-3 border-t px-3 pb-3 pt-3" style={{ borderColor: `${DEBT}26` }}>
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted-foreground">Gläubiger / Zweck</span>
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={commitEdit} className="h-9 w-full rounded-lg border border-border bg-white/[0.04] px-2.5 text-sm outline-none focus:border-primary/50" />
          </label>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-[11px] text-muted-foreground">Gesamtbetrag €</span>
              <input value={total} onChange={(e) => setTotal(e.target.value.replace(/[^0-9.,]/g, ""))} onBlur={commitEdit} inputMode="decimal" className="h-9 w-full rounded-lg border border-border bg-white/[0.04] px-2.5 text-sm outline-none focus:border-primary/50" />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-[11px] text-muted-foreground">Rate/Monat € (optional)</span>
              <input value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.,]/g, ""))} onBlur={commitEdit} inputMode="decimal" className="h-9 w-full rounded-lg border border-border bg-white/[0.04] px-2.5 text-sm outline-none focus:border-primary/50" />
            </label>
          </div>
          <button onClick={remove} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Schuld löschen
          </button>
        </div>
      )}
    </div>
  )
}

function AddDebtForm({ onSave, onCancel }: { onSave: (input: Omit<Debt, "id" | "createdAt" | "person">) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("")
  const [total, setTotal] = useState("")
  const [paid, setPaid] = useState("")
  const [rate, setRate] = useState("")
  const [error, setError] = useState(false)

  return (
    <div className="space-y-3 border-b border-border bg-white/[0.02] p-4">
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gläubiger / Zweck (z. B. Autokredit Sparkasse)" className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input value={total} onChange={(e) => { setTotal(e.target.value.replace(/[^0-9.,]/g, "")); setError(false) }} inputMode="decimal" placeholder="Gesamtbetrag €" className={cn("h-10 rounded-lg border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50", error ? "border-destructive" : "border-border")} />
        <input value={paid} onChange={(e) => setPaid(e.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" placeholder="Bereits getilgt € (optional)" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
        <input value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" placeholder="Rate/Monat € (optional)" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" onClick={() => {
          const t = parseAmount(total)
          if (!title.trim() || !Number.isFinite(t) || t <= 0) { setError(true); return }
          const p = parseAmount(paid)
          const r = parseAmount(rate)
          onSave({ title: title.trim(), total: t, paid: Number.isFinite(p) && p > 0 ? Math.min(p, t) : 0, monthlyRate: Number.isFinite(r) && r > 0 ? r : undefined })
        }}>Speichern</Button>
      </div>
    </div>
  )
}

/* ---------- private Buchung erfassen ---------- */

function AddPrivateTx({ onSave, onCancel }: { onSave: (input: Omit<Transaction, "id" | "scope" | "person">) => void; onCancel: () => void }) {
  const [type, setType] = useState<TxType>("expense")
  const [category, setCategory] = useState(PRIVATE_EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState("")
  const [error, setError] = useState(false)
  const cats = type === "income" ? PRIVATE_INCOME_CATEGORIES : PRIVATE_EXPENSE_CATEGORIES

  return (
    <div className="space-y-3 border-b border-border bg-white/[0.02] p-4">
      <div className="flex gap-2">
        <button onClick={() => { setType("expense"); setCategory(PRIVATE_EXPENSE_CATEGORIES[0]) }} className={cn("flex-1 rounded-lg border py-2 text-sm font-medium transition-colors", type === "expense" ? "border-transparent" : "border-border text-muted-foreground")} style={type === "expense" ? { backgroundColor: `${EXPENSE}26`, color: EXPENSE } : undefined}>Ausgabe</button>
        <button onClick={() => { setType("income"); setCategory(PRIVATE_INCOME_CATEGORIES[0]) }} className={cn("flex-1 rounded-lg border py-2 text-sm font-medium transition-colors", type === "income" ? "border-transparent" : "border-border text-muted-foreground")} style={type === "income" ? { backgroundColor: `${INCOME}26`, color: INCOME } : undefined}>Einnahme</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.,]/g, "")); setError(false) }} inputMode="decimal" placeholder="Betrag €" className={cn("h-10 rounded-lg border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50", error ? "border-destructive" : "border-border")} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz (optional)" className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" onClick={() => {
          const val = parseAmount(amount)
          if (!Number.isFinite(val) || val <= 0) { setError(true); return }
          onSave({ type, category, amount: val, taxRate: 0, date, note: note.trim() || undefined })
        }}>Speichern</Button>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, accent }: { icon: typeof TrendingUp; label: string; value: string; accent: string }) {
  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-2xl p-4"
      style={{ background: `linear-gradient(135deg, ${accent}2e, ${accent}0d 70%)`, border: `1px solid ${accent}55`, boxShadow: `inset 0 1px 0 0 ${accent}33, 0 10px 34px -14px ${accent}99` }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}33`, color: accent, border: `1px solid ${accent}66` }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="eyebrow truncate" style={{ color: `${accent}cc` }}>{label}</div>
        <div className="num truncate font-heading text-[clamp(1rem,5vw,1.5rem)] font-bold leading-tight sm:text-2xl" style={{ color: accent }}>{value}</div>
      </div>
    </div>
  )
}
