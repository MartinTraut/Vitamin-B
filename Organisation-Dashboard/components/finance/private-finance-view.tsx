"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Plus, TrendingUp, TrendingDown, Wallet, Landmark, Trash2, ArrowDownLeft, ArrowUpRight,
  ChevronRight, CreditCard, X, Building2, ArrowRight,
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
import { eur, eur0 } from "@/lib/format"
import { todayISO } from "@/lib/recurrence"
import { buildSeries, GRAN_LABEL, type Gran } from "@/lib/finance-series"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiTile } from "@/components/ui/kpi-tile"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { LedgerTable } from "@/components/ui/ledger-table"
import { FinanceChart, CategoryDonut, ChartLegend, type SeriesKey } from "@/components/dashboard/charts"
import { cn } from "@/lib/utils"
import { INCOME, EXPENSE, ORANGE, DEBT } from "@/lib/theme-colors"

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
  // Welche Verlauf-Linien sichtbar sind (über die Legende umschaltbar).
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({ income: true, expense: true, profit: true, debt: true })
  const toggleSeries = (k: SeriesKey) => setVisible((v) => ({ ...v, [k]: !v[k] }))

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
        <Link
          href="/finanzen"
          className="group flex shrink-0 items-center gap-2 rounded-xl border border-primary/45 bg-primary/15 px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:border-primary/70 hover:bg-primary/25 hover:shadow-md hover:shadow-primary/10"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span>Zu den Firmen-Finanzen</span>
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile icon={TrendingUp} label="Einnahmen" value={eur0(m.income)} accent={INCOME} />
        <KpiTile icon={TrendingDown} label="Ausgaben" value={eur0(m.expense)} accent={EXPENSE} />
        <KpiTile icon={Wallet} label="Saldo" value={eur0(m.saldo)} accent={m.saldo >= 0 ? INCOME : EXPENSE} />
        <KpiTile icon={Landmark} label="Restschulden" value={eur0(m.debtRemaining)} accent={DEBT} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Verlauf */}
        <Card className="flex flex-col lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 pb-2">
            <h3 className="font-heading text-base font-bold">Verlauf · privat</h3>
            <div className="flex flex-wrap items-center gap-3">
              <ChartLegend
                visible={visible}
                onToggle={toggleSeries}
                items={[
                  { key: "income", color: INCOME },
                  { key: "expense", color: EXPENSE },
                  { key: "profit", color: ORANGE, label: "Saldo" },
                  ...(myDebts.length > 0 ? [{ key: "debt" as SeriesKey, color: DEBT }] : []),
                ]}
              />
              <SegmentedControl
                value={gran}
                onChange={(v) => setGran(v as Gran)}
                options={(["day", "week", "month"] as Gran[]).map((g) => ({ v: g, l: GRAN_LABEL[g] }))}
              />
            </div>
          </div>
          <div className="min-h-[240px] flex-1 p-3 pt-1">
            <FinanceChart data={chartData} height="full" visible={visible} labels={{ profit: "Saldo" }} />
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
        {/* Echte Tabellen-Struktur mit Monats-Gruppen — Betrag auf fester rechtsbündiger Achse */}
        <LedgerTable
          emptyText="Noch keine privaten Buchungen."
          rows={m.sorted.map((t) => {
            const inc = t.type === "income"
            const color = inc ? INCOME : EXPENSE
            return {
              id: t.id,
              label: t.category,
              note: t.note,
              date: t.date,
              amount: t.amount,
              sign: inc ? ("+" as const) : ("−" as const),
              color,
              icon: inc ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />,
              onRemove: () => removeTransaction(t.id),
              removeLabel: "Buchung löschen",
            }
          })}
        />

        {/* Summen-Fußzeile — konsistent zu Firmen-Finanzen & Belegen */}
        {m.sorted.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-white/[0.015] px-4 py-2.5 text-xs">
            <span className="text-muted-foreground">{m.sorted.length} {m.sorted.length === 1 ? "Buchung" : "Buchungen"}</span>
            <span className="font-semibold text-muted-foreground">
              Saldo <span className="num font-bold" style={{ color: m.saldo >= 0 ? INCOME : EXPENSE }}>{m.saldo >= 0 ? "+" : "−"}{eur(Math.abs(m.saldo))}</span>
            </span>
          </div>
        )}
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
  const [note, setNote] = useState(debt.note ?? "")

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
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: done ? `${INCOME}44` : `${DEBT}33`, background: done ? `${INCOME}0d` : `${DEBT}0d` }}>
      <div className="flex items-start gap-2.5 p-3.5 pb-2.5">
        <button onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0 transition-transform", open && "rotate-90")} style={{ color: done ? INCOME : DEBT }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[clamp(1rem,0.4vw+0.9rem,1.15rem)] font-bold leading-tight">{debt.title}</span>
            <span className="block text-[clamp(0.85rem,0.25vw+0.78rem,0.95rem)] text-muted-foreground">
              {eur0(debt.paid)} / {eur0(debt.total)}{debt.monthlyRate ? ` · ${eur0(debt.monthlyRate)}/Mt.` : ""}
            </span>
            {debt.note && !open && (
              <span className="mt-0.5 block truncate text-[clamp(0.8rem,0.2vw+0.74rem,0.9rem)] text-muted-foreground/70">{debt.note}</span>
            )}
          </span>
        </button>
        <div className="shrink-0 text-right">
          <div className="num font-heading text-[clamp(1.05rem,1vw+0.85rem,1.25rem)] font-bold leading-none" style={{ color: done ? INCOME : DEBT }}>{done ? "Getilgt" : eur0(remaining)}</div>
          {!done && <div className="mt-0.5 text-[clamp(0.78rem,0.2vw+0.72rem,0.85rem)] font-medium text-muted-foreground">offen</div>}
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
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted-foreground">Notiz (z. B. Konditionen, Laufzeit, Vereinbarungen)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={commitEdit} rows={2} className="w-full resize-y rounded-lg border border-border bg-white/[0.04] px-2.5 py-2 text-sm outline-none focus:border-primary/50" />
          </label>
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
  const [note, setNote] = useState("")
  const [error, setError] = useState(false)

  return (
    <div className="space-y-3 border-b border-border bg-white/[0.02] p-4">
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gläubiger / Zweck (z. B. Autokredit Sparkasse)" className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input value={total} onChange={(e) => { setTotal(e.target.value.replace(/[^0-9.,]/g, "")); setError(false) }} inputMode="decimal" placeholder="Gesamtbetrag €" className={cn("h-10 rounded-lg border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50", error ? "border-destructive" : "border-border")} />
        <input value={paid} onChange={(e) => setPaid(e.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" placeholder="Bereits getilgt € (optional)" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
        <input value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" placeholder="Rate/Monat € (optional)" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz (optional) — z. B. Konditionen, Laufzeit" className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" onClick={() => {
          const t = parseAmount(total)
          if (!title.trim() || !Number.isFinite(t) || t <= 0) { setError(true); return }
          const p = parseAmount(paid)
          const r = parseAmount(rate)
          onSave({ title: title.trim(), total: t, paid: Number.isFinite(p) && p > 0 ? Math.min(p, t) : 0, monthlyRate: Number.isFinite(r) && r > 0 ? r : undefined, note: note.trim() || undefined })
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

